/**
 * API Route para corrección automática de exámenes con visión
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Obtener imagen como base64 desde URL local
async function getImageAsBase64(imageUrl: string): Promise<string> {
  // Si es base64 directo, retornarlo
  if (imageUrl.startsWith('data:image')) {
    return imageUrl
  }

  // Si es URL relativa (/uploads/xxx.jpg), obtener el archivo
  if (imageUrl.startsWith('/uploads/')) {
    const fs = await import('fs/promises')
    const path = await import('path')
    const filename = imageUrl.split('/').pop()
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename || '')

    try {
      const imageBuffer = await fs.readFile(filePath)
      const mimeType = filename?.endsWith('.png') ? 'image/png' :
                       filename?.endsWith('.jpg') || filename?.endsWith('.jpeg') ? 'image/jpeg' :
                       filename?.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
      return `data:${mimeType};base64,${imageBuffer.toString('base64')}`
    } catch (error) {
      console.error('Error reading image file:', error)
      throw new Error('No se pudo leer la imagen')
    }
  }

  // Si es URL externa, retornar tal cual
  return imageUrl
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, rubric, points } = body

    if (!imageUrl || !rubric) {
      return NextResponse.json(
        { error: 'Missing required fields: imageUrl, rubric' },
        { status: 400 }
      )
    }

    // Convertir imagen a base64 si es local
    const imageBase64 = await getImageAsBase64(imageUrl)

    // Llamar a la API de Novita para corrección con visión
    const response = await fetch('https://api.novita.ai/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NOVITA_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-vl-8b-instruct',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente especializado en corregir exámenes de alternativas. Tu tarea es examinar una imagen de un examen y detectar SOLAMENTE las alternativas marcadas por el alumno.

INSTRUCCIONES:
1. Examina la imagen del examen con atención
2. Identifica TODAS las preguntas y sus alternativas marcadas
3. Para cada pregunta, detecta qué alternativa está marcada (A, B, C, D, etc.)
4. Retorna SOLAMENTE un JSON válido con el formato: {"1": "A", "2": "C", "3": "B"}
   - La clave es el número de pregunta
   - El valor es la alternativa marcada
5. Si no hay marca en una pregunta, usa null como valor

IMPORTANTE:
- Responde SOLAMENTE con el JSON, sin texto adicional
- Usa null para preguntas sin respuesta
- Sé preciso en detectar las marcas`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Examina esta imagen de un examen y detecta las alternativas marcadas. Retorna un JSON con formato {"numero_pregunta": "alternativa_marcada"}. Si no hay marca en una pregunta, usa null.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64,
                },
              },
            ],
          },
        ],
        response_format: { type: 'text' },
        max_tokens: 4096,
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Novita API error:', errorText)
      return NextResponse.json(
        { error: 'Error al procesar la imagen' },
        { status: 500 }
      )
    }

    const result = await response.json()
    const content = result.choices[0]?.message?.content || '{}'

    // Intentar parsear el JSON de la respuesta
    let answers: Record<string, string | null> = {}
    try {
      // Limpiar el contenido para encontrar el JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        answers = JSON.parse(jsonMatch[0])
      } else {
        answers = JSON.parse(content)
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', content)
      return NextResponse.json(
        { error: 'Error al procesar la respuesta de la IA', rawResponse: content },
        { status: 500 }
      )
    }

    // Calcular puntaje y nota
    let totalScore = 0
    let maxScore = 0

    for (const [questionNum, markedAnswer] of Object.entries(answers)) {
      const correctAnswer = rubric[questionNum]
      const questionPoints = points?.[questionNum] || 1

      maxScore += questionPoints

      if (markedAnswer === correctAnswer) {
        totalScore += questionPoints
      }
    }

    // Calcular nota (escala 1.0 - 7.0)
    const rawGrade = (totalScore / maxScore) * 7
    const grade = Math.round(rawGrade * 10) / 10 // Redondear a 1 decimal

    return NextResponse.json({
      success: true,
      answers,
      totalScore,
      maxScore,
      grade,
      rawResponse: content,
    })
  } catch (error) {
    console.error('Error in grade API:', error)
    return NextResponse.json(
      { error: 'Error al procesar la corrección' },
      { status: 500 }
    )
  }
}
