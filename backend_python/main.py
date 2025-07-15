from fastapi import FastAPI
from .api.jisho import router as jisho_router
from .api.paddle_ocr import router as paddle_ocr_router
from .quiz_generator import router as quiz_generator_router
from .api.crud import router as crud_router
from .api.tatoeba import router as tatoeba_router
from .api.kanjialive import router as kanjialive_router
from .api.translate import router as translation_router
from .config.settings import settings
from .api.auth_api import router as auth_router
from .api.my_kanjis import router as my_kanjis_router
from .api.ranking import router as ranking_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://192.168.1.42:19006"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jisho_router)
app.include_router(paddle_ocr_router)
app.include_router(quiz_generator_router)
app.include_router(crud_router)
app.include_router(tatoeba_router)
app.include_router(kanjialive_router) 
app.include_router(translation_router)
app.include_router(auth_router)
app.include_router(my_kanjis_router)
app.include_router(ranking_router)

@app.get("/")
async def root():
    return {"message": "Hello World"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=settings.port, reload=True)
