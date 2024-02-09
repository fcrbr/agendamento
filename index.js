const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const AppointmentService = require("./services/AppointmentService");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

mongoose.connect("mongodb://127.0.0.1:27017/agendamento");
//mongoose.set('useFindAndModify', false);
// Configurando o Express para servir arquivos estáticos do FullCalendar
app.use('/fullcalendar', express.static(__dirname + '/node_modules/@fullcalendar'));
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/cadastro",(req, res) => {
    res.render("create");
})

app.post("/create", async (req, res) => {

    console.log(typeof req.body.name); // Verificar o tipo de dado de req.body.name
var status = await AppointmentService.Create(
    req.body.name,
    req.body.email,
    req.body.description,
    req.body.cpf,
    req.body.date,
    req.body.time   
    )

    if(status){
        res.redirect("/");
    }else{
        res.send("ocorreu uma falha!");
    }

});

app.get("/getcalendar", async (req, res) => {
    var apponintments = await AppointmentService.GetAll(false);
    res.json(apponintments);
});

app.get("/event/:id", async (req, res) => {
    var appointment = await AppointmentService.GetById(req.params.id);
    console.log(appointment);
    
    res.render("event",{appo: appointment});
    //console.log(await AppointmentService.GetById(req.param.id));
    //res.json({id: req.params.id});
})

app.post("/finish", async (req, res) => {
    var id = req.body.id;
    await AppointmentService.Finish(id);
    res.redirect("/");

});

app.get("/list", async (req, res) => {
   
   // await AppointmentService.Search();
    var appos = await AppointmentService.GetAll(true);
    res.render("list",{appos});
    // res.json(appos);
});

app.get("/searchresult", async (req, res) => {
  var appos = await AppointmentService.Search(req.query.search);
  res.render("list",{appos});

})


var pollTime = 1000 * 60 * 5;

setInterval(async () => {
    await AppointmentService.SendNotification();
},pollTime)




app.listen(8080, () => {});