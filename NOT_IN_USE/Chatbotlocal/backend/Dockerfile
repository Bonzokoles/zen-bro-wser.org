# Dockerfile optymalny dla GPU (użyj obrazu z CUDA)
FROM pytorch/pytorch:2.2.0-cuda11.8-cudnn8-runtime

WORKDIR /app
COPY . /app

RUN pip install --upgrade pip
RUN pip install -r backend/requirements.txt

# Zakładamy, że model jest dostarczony w folderze backend/models albo montowany jako volume.
EXPOSE 8000
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]