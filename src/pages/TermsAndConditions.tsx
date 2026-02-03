import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-custom max-w-4xl">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>

          <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar Huellas Digitales, usted acepta cumplir con estos términos y condiciones.
                Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">2. Descripción del Servicio</h2>
              <p>
                Huellas Digitales es una plataforma digital que conecta personas interesadas en adoptar mascotas
                con aquellas que buscan un hogar para animales. También facilitamos la publicación de mascotas
                perdidas y la compartición de historias de adopción exitosas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">3. Responsabilidades del Usuario</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Proporcionar información veraz y actualizada en todas las publicaciones</li>
                <li>Mantener la confidencialidad de su cuenta y contraseña</li>
                <li>No utilizar el servicio para actividades ilegales o fraudulentas</li>
                <li>Tratar a los animales con respeto y cumplir con las leyes locales de protección animal</li>
                <li>Respetar a otros usuarios de la plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">4. Publicaciones y Contenido</h2>
              <p className="mb-3">
                Los usuarios son responsables del contenido que publican en la plataforma. Nos reservamos el
                derecho de eliminar cualquier contenido que consideremos inapropiado, ofensivo o que viole
                estos términos.
              </p>
              <p>
                Al publicar contenido, usted garantiza que tiene los derechos necesarios sobre las imágenes
                y la información compartida.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">5. Proceso de Adopción</h2>
              <p className="mb-3">
                Huellas Digitales actúa únicamente como intermediario para conectar adoptantes con
                responsables de mascotas. No somos responsables de:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>La veracidad de la información proporcionada por los usuarios</li>
                <li>El estado de salud o comportamiento de las mascotas</li>
                <li>Los acuerdos realizados entre adoptantes y dadores en adopción</li>
                <li>Cualquier disputa que surja después de la adopción</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">6. Filtrado por Región</h2>
              <p>
                La plataforma utiliza filtros regionales para mostrar mascotas disponibles en su área.
                Es responsabilidad del usuario verificar la ubicación exacta y la disponibilidad de
                la mascota antes de proceder con una adopción.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">7. Mascotas Perdidas</h2>
              <p>
                Las publicaciones de mascotas perdidas son de buena fe. Huellas Digitales no verifica
                la propiedad de las mascotas reportadas como perdidas. Recomendamos a los usuarios
                solicitar pruebas de propiedad antes de devolver una mascota encontrada.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">8. Limitación de Responsabilidad</h2>
              <p>
                Huellas Digitales no será responsable de ningún daño directo, indirecto, incidental,
                especial o consecuente que resulte del uso o la imposibilidad de usar nuestros servicios,
                incluyendo pero no limitado a problemas relacionados con mascotas adoptadas o encontradas
                a través de la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">9. Modificaciones del Servicio</h2>
              <p>
                Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del
                servicio en cualquier momento sin previo aviso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">10. Modificaciones de los Términos</h2>
              <p>
                Podemos actualizar estos términos y condiciones periódicamente. El uso continuado de
                nuestros servicios después de dichos cambios constituye su aceptación de los nuevos términos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">11. Propiedad Intelectual</h2>
              <p className="mb-3">
                Todo el contenido de la plataforma, incluyendo diseño, logotipos, textos, gráficos y código,
                es propiedad de Huellas Digitales o sus licenciantes. Los usuarios conservan los derechos
                sobre el contenido que publican, pero otorgan a la plataforma una licencia no exclusiva
                para usar, mostrar y distribuir dicho contenido dentro del servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">12. Prohibiciones</h2>
              <p className="mb-3">Está estrictamente prohibido:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Publicar información falsa o engañosa sobre mascotas</li>
                <li>Utilizar la plataforma para venta comercial de animales</li>
                <li>Acosar, amenazar o intimidar a otros usuarios</li>
                <li>Intentar acceder a cuentas de otros usuarios</li>
                <li>Publicar contenido ofensivo, discriminatorio o ilegal</li>
                <li>Usar bots o scripts automatizados sin autorización</li>
                <li>Revender o redistribuir el acceso a la plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">13. Suspensión y Terminación</h2>
              <p>
                Nos reservamos el derecho de suspender o terminar su cuenta sin previo aviso si
                determina que ha violado estos términos o ha realizado actividades que perjudican
                a la plataforma o a otros usuarios. En caso de terminación, perderá el acceso a
                su cuenta y todo el contenido asociado.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">14. Indemnización</h2>
              <p>
                Usted acepta indemnizar y mantener indemne a Huellas Digitales, sus directores,
                empleados y afiliados de cualquier reclamo, pérdida, responsabilidad, daño o
                gasto (incluyendo honorarios legales) que surja de su uso de la plataforma o
                violación de estos términos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">15. Resolución de Disputas</h2>
              <p>
                En caso de disputa con otro usuario, usted libera a Huellas Digitales de cualquier
                reclamo, demanda o daño relacionado. Cualquier controversia que surja de estos
                términos se intentará resolver primero mediante negociación de buena fe.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">16. Ley Aplicable y Jurisdicción</h2>
              <p>
                Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa
                relacionada con estos términos será resuelta en los tribunales competentes de Argentina,
                renunciando expresamente a cualquier otro fuero o jurisdicción que pudiera corresponder.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">17. Divisibilidad</h2>
              <p>
                Si alguna disposición de estos términos se considera inválida o inaplicable por
                un tribunal competente, las disposiciones restantes continuarán en pleno vigor
                y efecto.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">18. Contacto</h2>
              <p>
                Si tiene preguntas sobre estos términos y condiciones, puede contactarnos en:
                <a href="mailto:zioncode25@gmail.com" className="text-primary hover:underline ml-1">
                  zioncode25@gmail.com
                </a>
              </p>
            </section>

            <div className="pt-6 border-t">
              <p className="text-sm">
                Última actualización: {new Date().toLocaleDateString('es-AR')}
              </p>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
};

export default TermsAndConditions;
