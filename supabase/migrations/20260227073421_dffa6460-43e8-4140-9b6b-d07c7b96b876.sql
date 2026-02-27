-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS on user_roles: users can read their own roles
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admin policy on profiles: admins can view all profiles
CREATE POLICY "Admins can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));