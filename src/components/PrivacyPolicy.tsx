import React from 'react';
import { motion } from 'motion/react';

export function PrivacyPolicy() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto space-y-8 bg-white p-8 md:p-12 rounded-2xl border border-zinc-200 shadow-sm"
    >
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Política de Privacidad</h1>
        <p className="text-zinc-500">Última actualización: Abril de 2026</p>
      </div>

      <div className="space-y-6 text-zinc-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">1. Información que recopilamos</h2>
          <p>
            En Optimiza tu CV, recopilamos la información que usted proporciona directamente al utilizar nuestro servicio. Esto incluye el texto de su currículum, archivos subidos (PDF/DOCX), su rol objetivo y cualquier otra información que ingrese en los campos del formulario para optimizar su CV.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">2. Uso de la información</h2>
          <p>
            Utilizamos la información recopilada exclusivamente para:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Procesar y optimizar su currículum mediante inteligencia artificial (Google Gemini).</li>
            <li>Generar el documento final en el formato seleccionado.</li>
            <li>Mejorar temporalmente la calidad de los resultados durante su sesión.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">3. Retención de datos</h2>
          <p>
            <strong>No almacenamos permanentemente su información personal ni su currículum.</strong> Todos los datos procesados se mantienen únicamente en la memoria de su navegador durante la sesión activa. Una vez que cierra la pestaña o recarga la página, los datos de su CV se eliminan por completo. No guardamos copias en nuestros servidores.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">4. Compartir información con terceros</h2>
          <p>
            Para proporcionar nuestro servicio, compartimos temporalmente el texto de su CV con la API de Google Gemini para su procesamiento. Google procesa esta información de acuerdo con sus propias políticas de privacidad y términos de servicio para APIs de IA.
          </p>
          <p>
            Además, utilizamos Google AdSense para mostrar anuncios. AdSense puede utilizar cookies para mostrar anuncios relevantes basados en sus visitas anteriores a este u otros sitios web.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">5. Cookies y Tecnologías de Rastreo</h2>
          <p>
            Utilizamos cookies de terceros (como las de Google AdSense) con fines publicitarios y analíticos. Puede configurar su navegador para rechazar todas las cookies o para indicar cuándo se envía una cookie.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">6. Cambios a esta política</h2>
          <p>
            Podemos actualizar nuestra Política de Privacidad periódicamente. Le notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "Última actualización".
          </p>
        </section>
      </div>
    </motion.div>
  );
}
