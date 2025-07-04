from fastapi import FastAPI
from backend_python.api.jisho import router as jisho_router
from backend_python.api.paddle_ocr import router as paddle_ocr_router
from backend_python.api.crud import router as crud_router
from backend_python.quiz_generator import router as quiz_generator_router
from backend_python.api.translate import router as translation_router
from backend_python.api.tatoeba import router as tatoeba_router
from backend_python.api.kanjialive import router as kanjialive_router
from backend_python.config.settings import settings
from backend_python.api.my_kanjis import router as my_kanjis_router


app = FastAPI()
app.include_router(jisho_router)
app.include_router(paddle_ocr_router)
app.include_router(quiz_generator_router)
app.include_router(crud_router)
app.include_router(translation_router)
app.include_router(tatoeba_router)
app.include_router(kanjialive_router) 
app.include_router(my_kanjis_router)

@app.get("/")
async def root():
    return {"message": "Hello World"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=settings.port, reload=True)
