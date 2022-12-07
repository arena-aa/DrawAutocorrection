# DrawAutocorrection
This is a study project about creating a Deep Learning Model deploing it on production using Flask API


Project Structure
This project has four major parts :
* models - This folder contains a Deep Learning model, which is aimed to claasify geometric shapes. 
* app.py - This contains Flask APIs that receives a picture from web editor, computes precited class of shape based on DL model and returns it. 
* templates - This folder contains the HTML template. 
* static - This folder contains CSS and JS file that allows to draw on the web browser.


1. Run app.py using below command to start Flask API
python app.py
By default, flask will run on port 5000.

2. Navigate to URL
http://localhost:5000

3. You should be able to view the homepage.

Draw any of 5 shapes (arrow,circle,line,rectangle,triangle) and watch how it automatically corrects.
