# Documentación de API de Supabase

Este documento describe las funciones y utilidades personalizadas de base de datos implementadas en Supabase para el proyecto Huellas Digitales.

## Funciones de Base de Datos (RPC)

Las siguientes funciones se encuentran en el esquema `public` y son accesibles para ser utilizadas en políticas RLS (Row Level Security) o llamadas RPC desde el cliente.

### `has_role`

Verifica si un usuario tiene un rol específico asignado en la tabla `user_roles`.

- **Firma**: `public.has_role(_user_id UUID, _role app_role)`
- **Retorno**: `BOOLEAN` (`true` si el usuario tiene el rol, `false` en caso contrario)
- **Seguridad**: `SECURITY DEFINER` (se ejecuta con privilegios del creador de la función para leer la tabla `user_roles`)

**Parámetros:**
- `_user_id`: UUID del usuario a consultar (generalmente `auth.uid()`).
- `_role`: El rol a verificar. Tipo `app_role` (valores: `'admin'`, `'moderator'`, `'user'`).

**Ejemplo de Uso (Política RLS):**
```sql
-- Permitir DELETE solo a administradores
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
```

---

### `get_user_province`

Obtiene la provincia asociada al perfil de un usuario de forma segura.

- **Firma**: `public.get_user_province(user_id UUID)`
- **Retorno**: `TEXT` (El nombre de la provincia o `null` si no tiene)
- **Seguridad**: `SECURITY DEFINER` (se ejecuta con privilegios para leer la tabla `profiles`)

**Parámetros:**
- `user_id`: UUID del usuario del cual obtener la provincia.

**Ejemplo de Uso (Política RLS):**
```sql
-- Permitir ver animales si el usuario está en la misma provincia
CREATE POLICY "Users can see animals from same province"
ON public.animals
FOR SELECT
USING (
  public.get_user_province(auth.uid()) = public.get_user_province(user_id)
);
```
