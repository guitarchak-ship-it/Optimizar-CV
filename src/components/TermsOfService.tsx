import React from 'react';
import { motion } from 'motion/react';

export function TermsOfService() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto space-y-8 bg-white p-8 md:p-12 rounded-2xl border border-zinc-200 shadow-sm"
    >
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Términos de Servicio</h1>
        <p className="text-zinc-500">Última actualización: Abril de 2026</p>
      </div>

      <div className="space-y-6 text-zinc-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar CV Optimizer AI, usted acepta estar sujeto a estos Términos de Servicio. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder ni utilizar nuestro servicio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">2. Descripción del Servicio</h2>
          <p>
            CV Optimizer AI es una herramienta basada en inteligencia artificial que ayuda a los usuarios a mejorar, formatear y optimizar sus currículums vitae (CV) para roles específicos. El servicio se proporciona "tal cual" y "según disponibilidad".
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">3. Uso Aceptable y Responsabilidades</h2>
          <p>
            Al utilizar nuestro servicio, usted se compromete a:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>No subir ni procesar información confidencial, ilegal, difamatoria o que viole los derechos de privacidad de terceros.</li>
            <li>No utilizar el servicio para generar información falsa, engañosa o fraudulenta en su currículum.</li>
            <li>Revisar cuidadosamente el resultado generado por la IA antes de utilizarlo para cualquier propósito profesional o de contratación.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">4. Limitación de Responsabilidad (Resultados de IA)</h2>
          <p>
            <strong>Aviso importante:</strong> Los currículums generados por CV Optimizer AI son creados mediante modelos de lenguaje de inteligencia artificial (Google Gemini). Aunque nos esforzamos por ofrecer resultados de alta calidad:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>No garantizamos la precisión, veracidad o idoneidad del contenido generado.</li>
            <li>El usuario es el único responsable de verificar y editar el currículum final antes de enviarlo a empleadores.</li>
            <li>No garantizamos entrevistas, ofertas de trabajo ni ningún resultado profesional derivado del uso de esta herramienta.</li>
            <li>No nos hacemos responsables de errores, omisiones o "alucinaciones" (información inventada) que la IA pueda generar.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">5. Propiedad Intelectual</h2>
          <p>
            Usted retiene todos los derechos sobre la información original que proporciona. El diseño, código fuente y estructura de la aplicación CV Optimizer AI son propiedad exclusiva de sus creadores.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">6. Publicidad y Enlaces de Terceros</h2>
          <p>
            Nuestro servicio puede contener anuncios proporcionados por terceros (como Google AdSense) y enlaces a sitios web externos. No somos responsables del contenido, políticas de privacidad o prácticas de sitios web o servicios de terceros.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">7. Modificaciones del Servicio</h2>
          <p>
            Nos reservamos el derecho de modificar, suspender o discontinuar, temporal o permanentemente, el servicio (o cualquier parte del mismo) con o sin previo aviso en cualquier momento.
          </p>
        </section>
      </div>
    </motion.div>
  );
}
