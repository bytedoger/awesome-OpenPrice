import os
from dotenv import load_dotenv

# Determine the env file to load (default to .env.local)
env_file = os.environ.get("ENV_FILE", ".env.local")
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', env_file)

# Load the environment variables (override=False allows CLI env vars to take precedence)
load_dotenv(dotenv_path=env_path, override=False)
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase credentials in .env.local")
