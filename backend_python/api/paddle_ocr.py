from fastapi import APIRouter
from paddleocr import PaddleOCR
from PIL import Image
import io
from fastapi import UploadFile, Request

router = APIRouter()
ocr = PaddleOCR(use_angle_cls=False, lang='japan')


@router.post("/uploadfile")
async def create_upload_file(request: Request, file: UploadFile| None = None):
    if not file:
        return {"message": "No upload file sent"}
    else:
        contents = await file.read()
        temp_path = f"temp_{file.filename}"
        image = Image.open(io.BytesIO(contents))
        image.save(temp_path)

        results = ocr.predict(temp_path)
        for res in results:
            res.save_to_img("images/results.jpg")

        extracted_text=results[0]["rec_texts"]

        print("Full recognized texts:", extracted_text)

        text_list=[]
        for line in extracted_text:
            line_l=list(line)
            for word in line_l:
                text_list.append(word)

        return text_list
