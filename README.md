# Speech to Text Demo with Bing Speech and LUIS

_An application that does speech recognition and returns weather data for the city you asked about_.

![STT Demo](sttdemo.gif)

This application is a simple live audio recorder that is based on RecorderJS and uses the [Bing Speech API](https://www.microsoft.com/cognitive-services/en-us/speech-api/documentation/overview) to recognize user's voice command while it also uses [LUIS](https://www.microsoft.com/cognitive-services/en-us/luis-api/documentation/home)(Language Understanding Intelligent Services) to interpret the location the user is asking about, then it returns the current weather information for that location using the [openweathermap APIs](http://openweathermap.org/). 

## Installation

Clone this repo and then install dependencies:

    git clone https://github.com/ritazh/sttdemo.git
    cd sttdemo
    npm i


Run the application then hit your browser with `http://localhost:3000`:

    node app.js


Setup your own keys for Bing Speech and LUIS:

* Sign up for Microsoft Cognitive Service [here](https://www.microsoft.com/cognitive-services/en-us/sign-up) and get your keys for Speech API
* Follow the steps [here](https://www.microsoft.com/cognitive-services/en-us/luis-api/documentation/getstartedwithluis-basics) to get your LUIS application id and your LUIS Subscription-key.

## Acknowledgement
Many thanks to @cwilso for developing and maintaining AudioRecorder for the awesome UI components in this app.

## License
Licensed using the MIT License (MIT); Copyright (c) Microsoft Corporation. For more information, please see [LICENSE](LICENSE).
