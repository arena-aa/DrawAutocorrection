import os.path

from flask import Flask
from flask import render_template,url_for,request
import io, base64
from PIL import Image

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.preprocessing.image import load_img
import numpy as np


app = Flask(__name__)


def model_predict(file_path,model):
    img = image.load_img(file_path, target_size=(395,745))
    pic = image.img_to_array(img)
    pic = np.expand_dims(pic, axis=0)
    pic /= 255

    preds = model.predict(pic)
    return preds

model_path = 'models/pretrained_model.h5'
model = load_model(model_path)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/uploadImage', methods = ['POST'])
def upload():
    print(request)
    if request.method == 'POST':
        imageData = request.json['image']
        id = request.json['id']
        imageDataStr = imageData.replace("data:image/png;base64,", "")

        with open("imageToSave.png", "wb") as fh:
            fh.write(base64.b64decode(imageDataStr))

        basepath = os.path.dirname(__file__)
        path = os.path.join(basepath, 'imageToSave.png')

        class_prediction = model_predict(path,model)
        classes_x = np.argmax(class_prediction, axis=1)

        return {
            "type": int(classes_x[0]),
            "id": id
        }
    return {
        "error": "Incorrect request method"
    }








if __name__ == '__main__':
    app.run(debug=True)





