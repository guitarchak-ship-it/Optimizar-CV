import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CVInput {
  name?: string;
  cvText: string;
  targetRole: string;
  recentUpdates: string;
  keySkills: string;
  tone: string;
  photoBase64?: string;
}

export interface CVResult {
  name: string;
  finalDocument: string;
  improvementNotes: string;
}

export async function optimizeCV(input: CVInput): Promise<CVResult> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
Actúa como un Especialista en Reclutamiento Tecnológico y Editor de Documentos Profesionales. Tu misión es transformar currículums obsoletos en perfiles de alto impacto para el mercado laboral actual.

PROCESO:
1. Investigación de Mercado: Usa Google Search para identificar los requisitos actuales (año 2026) para el rol: "${input.targetRole}". Busca palabras clave ATS y habilidades demandadas.
2. Identificación: Extrae el nombre completo de la persona del CV original si no se proporciona explícitamente.
3. Fusión y Mejora: Combina el CV antiguo con las actualizaciones recientes.
4. Optimización de Compaginación: 
   - Estructura el contenido para que quepa idealmente en UNA SOLA PÁGINA de tamaño Carta (Letter).
   - Sé conciso: usa viñetas (bullets) en lugar de párrafos largos.
   - Prioriza la información más relevante para el rol objetivo.
   - Asegura que los encabezados sean claros y consistentes.
   - IMPORTANTE: El campo finalDocument debe contener Markdown estándar con saltos de línea reales. NO uses la secuencia de caracteres literal \\n.
5. Validación: Cumple con normas internacionales (sin foto para US/UK, enlaces a LinkedIn). Si se proporciona una foto, analízala para dar consejos sobre la imagen profesional en las notas.

TONO SOLICITADO: ${input.tone}

ENTREGA EL RESULTADO EN FORMATO JSON con tres campos:
- name: El nombre completo de la persona (extraído del CV o el proporcionado).
- finalDocument: El CV optimizado en Markdown.
- improvementNotes: Explicación de los cambios, palabras clave SEO añadidas y consejos sobre la foto profesional si se incluyó una.
`;

  const textPart = {
    text: `
CV ORIGINAL:
${input.cvText}

ROL OBJETIVO: ${input.targetRole}
ACTUALIZACIONES RECIENTES: ${input.recentUpdates}
HABILIDADES CLAVE: ${input.keySkills}
`,
  };

  const contents: any[] = [textPart];

  if (input.photoBase64) {
    const [mimeInfo, base64Data] = input.photoBase64.split(';base64,');
    const mimeType = mimeInfo.split(':')[1];
    contents.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "El nombre completo de la persona.",
            },
            finalDocument: {
              type: Type.STRING,
              description: "El CV optimizado en formato Markdown.",
            },
            improvementNotes: {
              type: Type.STRING,
              description: "Explicación de los cambios y consejos profesionales.",
            },
          },
          required: ["name", "finalDocument", "improvementNotes"],
        },
        tools: [{ googleSearch: {} }],
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      name: result.name || "Tu Nombre",
      finalDocument: result.finalDocument || "Error generando el documento.",
      improvementNotes: result.improvementNotes || "No se generaron notas.",
    };
  } catch (error) {
    console.error("Error optimizing CV:", error);
    throw error;
  }
}
