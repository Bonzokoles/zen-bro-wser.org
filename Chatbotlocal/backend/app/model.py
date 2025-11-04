# Prosty wrapper do ładowania modelu transformers (lokalnego, bez API)
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig

class LocalModel:
    def __init__(self, model_name_or_path="models/your-model-folder", device=None):
        # device detection
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device

        # Opcje optymalizacji pamięci
        self.tokenizer = AutoTokenizer.from_pretrained(model_name_or_path, use_fast=True)
        # low_cpu_mem_usage helps when loading large models
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name_or_path,
            device_map="auto" if self.device == "cuda" else None,
            low_cpu_mem_usage=True,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
        )
        if self.device == "cpu":
            self.model.to("cpu")

    def generate(self, prompt: str, max_tokens: int = 512):
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        # generuj w trybie inference
        with torch.inference_mode():
            gen = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                do_sample=True,
                top_p=0.95,
                temperature=0.7,
            )
        out = self.tokenizer.decode(gen[0], skip_special_tokens=True)
        # Zwracamy samą wygenerowaną część (możesz dopracować aby wyciąć prompt)
        return out