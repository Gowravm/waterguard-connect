
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create pollution_reports table
CREATE TABLE public.pollution_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  water_body_name TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  location_text TEXT,
  pollution_category TEXT NOT NULL,
  manual_severity INTEGER NOT NULL CHECK (manual_severity BETWEEN 1 AND 5),
  ai_severity INTEGER CHECK (ai_severity BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'action_planned', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pollution_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reports are viewable by everyone" ON public.pollution_reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reports" ON public.pollution_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reports" ON public.pollution_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reports" ON public.pollution_reports FOR DELETE USING (auth.uid() = user_id);

-- Create report_ai_analysis table
CREATE TABLE public.report_ai_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.pollution_reports(id) ON DELETE CASCADE NOT NULL,
  predicted_waste_type TEXT,
  predicted_tags TEXT[],
  confidence_score DOUBLE PRECISION,
  severity_score INTEGER CHECK (severity_score BETWEEN 1 AND 5),
  severity_reason TEXT,
  urgency_flag BOOLEAN DEFAULT false,
  suggested_action TEXT,
  model_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.report_ai_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI analysis viewable by everyone" ON public.report_ai_analysis FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create analysis" ON public.report_ai_analysis FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Create report_images table
CREATE TABLE public.report_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.pollution_reports(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.report_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Report images viewable by everyone" ON public.report_images FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload images" ON public.report_images FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create storage bucket for report images
INSERT INTO storage.buckets (id, name, public) VALUES ('report-images', 'report-images', true);

CREATE POLICY "Anyone can view report images" ON storage.objects FOR SELECT USING (bucket_id = 'report-images');
CREATE POLICY "Authenticated users can upload report images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'report-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete their own uploads" ON storage.objects FOR DELETE USING (bucket_id = 'report-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.pollution_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
