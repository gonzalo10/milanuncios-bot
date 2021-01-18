Frase que hay que poner en la console para conseguir el token:
fetch("https://www.milanuncios.com/api/v3/sessions/current").then(i => i.json()).then(x => console.log("apitoken: ", x.apiToken))
