import React from 'react';
import { motion } from 'motion/react';
import { Mail, User, Target, Lightbulb } from 'lucide-react';

export function About() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto space-y-8 bg-white p-8 md:p-12 rounded-2xl border border-zinc-200 shadow-sm"
    >
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Acerca de Optimiza tu CV</h1>
        <p className="text-zinc-500">Conoce la historia y el propósito detrás de esta herramienta.</p>
      </div>

      <div className="space-y-8 text-zinc-700 leading-relaxed">
        
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-zinc-900">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">¿Quién está detrás del proyecto?</h2>
          </div>
          <p className="pl-13">
            Hola, soy <strong>ShackPlay</strong>. Este proyecto es parte de mi iniciativa personal para crear herramientas útiles orientadas a la educación, el trabajo y los juegos de puzzle. Mi enfoque siempre está en desarrollar soluciones para el crecimiento personal, apoyadas por el poder de la Inteligencia Artificial.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-zinc-900">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Nuestra Misión</h2>
          </div>
          <p className="pl-13">
            El objetivo principal de Optimiza tu CV es acercar a las personas a las herramientas de IA de una manera fácil y divertida. Queremos que cualquier persona pueda utilizar esta tecnología de forma eficiente y sencilla para mejorar sus oportunidades laborales, sin necesidad de conocimientos técnicos.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-zinc-900">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Nuestra Filosofía</h2>
          </div>
          <div className="pl-13 space-y-3">
            <p>
              La Inteligencia Artificial ayuda muchísimo cuando sabes cómo usarla, pero es comprensible que muchas personas aún le tengan temor o respeto. Por eso, creo firmemente que las herramientas que van directo al punto son el mejor puente hacia los beneficios de la IA.
            </p>
            <p>
              Mi vocación es acercar la IA a las personas con herramientas concretas y directas para solucionar problemas reales. De hecho, el mayor éxito de esta plataforma es que puedas utilizarla fácilmente, obteniendo resultados profesionales, incluso sin darte cuenta de la compleja tecnología de IA que está trabajando en segundo plano para ti.
            </p>
          </div>
        </section>

        <section className="space-y-4 pt-4 border-t border-zinc-100">
          <div className="flex items-center gap-3 text-zinc-900">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Contacto</h2>
          </div>
          <p className="pl-13">
            ¿Tienes alguna duda, sugerencia o comentario sobre la herramienta? Me encantaría escucharte. Puedes escribirme directamente a mi correo personal:
            <br />
            <a href="mailto:guitarchak@gmail.com" className="text-blue-600 hover:underline font-medium mt-2 inline-block">
              guitarchak@gmail.com
            </a>
          </p>
        </section>

      </div>
    </motion.div>
  );
}
