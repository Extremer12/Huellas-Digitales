import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
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

          <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>
          
          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">1. Introducción</h2>
              <p>
                En Huellas Digitales, nos comprometemos a proteger su privacidad y sus datos personales. 
                Esta política de privacidad explica cómo recopilamos, usamos, compartimos y protegemos 
                su información cuando utiliza nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">2. Información que Recopilamos</h2>
              <p className="mb-3">Recopilamos la siguiente información:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Información de cuenta:</strong> Nombre, correo electrónico, contraseña</li>
                <li><strong>Información de perfil:</strong> Nombre para mostrar, región (país y provincia)</li>
                <li><strong>Contenido del usuario:</strong> Publicaciones de mascotas, imágenes, historias de adopción</li>
                <li><strong>Información de uso:</strong> Cómo interactúa con la plataforma, páginas visitadas</li>
                <li><strong>Información técnica:</strong> Dirección IP, tipo de navegador, dispositivo utilizado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">3. Cómo Usamos su Información</h2>
              <p className="mb-3">Utilizamos su información para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Proporcionar y mantener nuestros servicios</li>
                <li>Crear y gestionar su cuenta de usuario</li>
                <li>Mostrar publicaciones de mascotas filtradas por región</li>
                <li>Facilitar la comunicación entre usuarios</li>
                <li>Mejorar nuestros servicios y experiencia de usuario</li>
                <li>Enviar notificaciones importantes sobre el servicio</li>
                <li>Prevenir fraudes y garantizar la seguridad de la plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">4. Compartir Información</h2>
              <p className="mb-3">
                No vendemos su información personal. Podemos compartir su información en las siguientes situaciones:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Con otros usuarios:</strong> Su información de perfil y publicaciones son visibles públicamente</li>
                <li><strong>Con proveedores de servicios:</strong> Empresas que nos ayudan a operar la plataforma</li>
                <li><strong>Por requisitos legales:</strong> Cuando sea necesario cumplir con la ley</li>
                <li><strong>En caso de transferencia empresarial:</strong> Si la empresa es vendida o fusionada</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">5. Almacenamiento de Datos</h2>
              <p>
                Sus datos se almacenan de forma segura en servidores protegidos. Implementamos medidas 
                de seguridad técnicas y organizativas para proteger su información contra acceso no 
                autorizado, pérdida o alteración.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">6. Retención de Datos</h2>
              <p>
                Conservamos su información personal mientras su cuenta esté activa o según sea necesario 
                para proporcionar servicios. Puede solicitar la eliminación de su cuenta y datos asociados 
                en cualquier momento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">7. Sus Derechos</h2>
              <p className="mb-3">Usted tiene derecho a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acceder a su información personal</li>
                <li>Corregir información inexacta</li>
                <li>Solicitar la eliminación de sus datos</li>
                <li>Oponerse al procesamiento de sus datos</li>
                <li>Solicitar la portabilidad de sus datos</li>
                <li>Retirar su consentimiento en cualquier momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">8. Cookies y Tecnologías Similares</h2>
              <p>
                Utilizamos cookies y tecnologías similares para mejorar su experiencia, analizar el uso 
                de la plataforma y personalizar el contenido. Puede configurar su navegador para rechazar 
                cookies, aunque esto puede afectar la funcionalidad del sitio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">9. Seguridad de Menores</h2>
              <p>
                Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos 
                intencionalmente información de menores. Si descubrimos que hemos recopilado 
                información de un menor, la eliminaremos de inmediato.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">10. Enlaces a Terceros</h2>
              <p>
                Nuestra plataforma puede contener enlaces a sitios web de terceros. No somos responsables 
                de las prácticas de privacidad de estos sitios. Le recomendamos revisar sus políticas de 
                privacidad.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">11. Transferencias Internacionales</h2>
              <p>
                Sus datos pueden ser transferidos y almacenados en servidores ubicados fuera de su país. 
                Nos aseguramos de que estas transferencias cumplan con las leyes de protección de datos 
                aplicables.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">12. Cambios en esta Política</h2>
              <p>
                Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre 
                cambios significativos publicando la nueva política en esta página y actualizando la 
                fecha de "última actualización".
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">13. Derechos bajo GDPR y Leyes Locales</h2>
              <p className="mb-3">
                Si se encuentra en la Unión Europea o en jurisdicciones con leyes de protección de
                datos similares, usted tiene derechos adicionales bajo el GDPR y la Ley de Protección
                de Datos Personales de Argentina (Ley 25.326):
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Derecho de acceso a sus datos personales</li>
                <li>Derecho de rectificación de datos inexactos</li>
                <li>Derecho de supresión ("derecho al olvido")</li>
                <li>Derecho a limitar el procesamiento</li>
                <li>Derecho a la portabilidad de datos</li>
                <li>Derecho a oponerse al procesamiento</li>
                <li>Derecho a presentar una queja ante la autoridad supervisora</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">14. Almacenamiento en la Nube</h2>
              <p>
                Sus datos, incluyendo imágenes de mascotas, se almacenan en servicios de nube seguros.
                Utilizamos cifrado en tránsito y en reposo para proteger su información. Los servidores
                pueden estar ubicados en diferentes regiones geográficas para optimizar el rendimiento
                y la disponibilidad del servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">15. Notificaciones por Email</h2>
              <p>
                Podemos enviarle correos electrónicos relacionados con su cuenta, actualizaciones
                importantes del servicio y notificaciones sobre adopciones. Puede optar por no
                recibir comunicaciones promocionales, pero seguirá recibiendo emails transaccionales
                necesarios para el funcionamiento de su cuenta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">16. Contacto y Oficial de Protección de Datos</h2>
              <p>
                Si tiene preguntas o inquietudes sobre esta política de privacidad o el manejo de sus 
                datos personales, puede contactarnos en:
              </p>
              <p className="mt-2">
                Email: 
                <a href="mailto:zioncode25@gmail.com" className="text-primary hover:underline ml-1">
                  zioncode25@gmail.com
                </a>
              </p>
              <p className="mt-3 text-sm">
                Para consultas específicas sobre protección de datos o para ejercer sus derechos
                bajo las leyes de privacidad aplicables, incluya "PROTECCIÓN DE DATOS" en el asunto
                del correo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">14. Consentimiento</h2>
              <p>
                Al utilizar Huellas Digitales, usted consiente la recopilación y uso de su información 
                según se describe en esta política de privacidad.
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

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
