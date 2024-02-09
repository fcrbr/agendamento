var appointment = require("../models/Appointment");
var mongoose = require("mongoose");
var AppointmentsFactory = require("../factories/AppointmentFactory");
var mailer = require("nodemailer");

const Appo = mongoose.model("Appointment", appointment);

class AppointmentService {
    async Create(name, email, description, cpf, date, time) {
        var newAppo = new Appo({
            name,
            email,
            description,
            cpf,
            date,
            time,
            finished: false,
            notified: false
        });

        try {
            await newAppo.save();
            return true; // Retorna true se o salvamento for bem-sucedido
        } catch (err) {
            console.log(err);
            return false; // Retorna false se ocorrer uma falha
        }
    }

    async GetAll(showFinished){
        if(showFinished){
            return await Appo.find();

        }else{
           var appos = await Appo.find({'finished': false});
           var apponintments = [];
           appos.forEach(appointment => {
                if(appointment.date != undefined){
                apponintments.push( AppointmentsFactory.Build(appointment) )
                }
           });
           return apponintments;
        }
    }

    async GetById(id){
        try{
            var event = await Appo.findOne({'_id': id});
            return event;
        }catch(err){
            console.log(err);
        }
    }

    async Finish(id){
        try{
            await Appo.findByIdAndUpdate(id,{finished: true});   
            return true; 
        }catch(err){
            console.log(err);
            return false;
        }
        
    }

    async Search(query){
        try{
      var appos = await Appo.find().or([{email: query},{cpf: query}])
      return appos;
        }catch(err){
      console.log(err);
      return [];
    }
}

    async SendNotification(){
        var appos = await this.GetAll(false);

        var transporter = mailer.createTransport({
            host:  "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "filipe@extensao.net",
                pass: "Yb1jBg%{!"
            }
        });



        appos.forEach(async app => {
            var date = app.start.getTime();
            var hour = 1000 * 60 * 60;
            var gap = date-Date.now();

            if (gap <= hour) {
              
                if(!app.notified){

                        await Appo.findByIdAndUpdate(app.id,{notified: true});

                       transporter.sendMail({
                        from: "Filipe Correa <filipe@extensao.net>",
                        to: app.email,
                        subject: "Sua consulta vai acontecer em breve",
                        text: "Sua consulta vai acontecer em 1 hora!"
                       }).then( () => {

                       }) .catch(err => {

                       })
               
                }
            }
        })
    }

}
module.exports = new AppointmentService();
