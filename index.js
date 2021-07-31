const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Joi = require('joi');
const _ = require('lodash');

const listSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    password:{
        type: String,
        reuired: true,
        minlength: 4
    },
    email:{
        type: String,
        required: true,
        unique: true
    }
});
const List = mongoose.model('List', listSchema);

mongoose.connect("mongodb://localhost/list", { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('MongoDBga ulanish hosil qilindi...');
})
.catch((err) => {
    console.error('MongoDBga ulanish vaqtida xato ro`y berdi...', err);
});
app.use(express.json());

app.post('/api/users', async (req, res) => {
    try {
        const { error } = validateList(req.body)
        if(error){
            return res.status(404).send(error.message);
        }
        let list = await List.findOne({email: req.body.email})
        if(list)
            return res.status(400).send('Bunday foydalanuvchi bor');
        list = new List(_.pick(req.body, ['name', 'email', 'password']));
        const salt = await bcrypt.genSalt();
        list.password = await bcrypt.hash(list.password, salt);
    
        await list.save();
        res.send(_.pick(list, ['_id','name','email']));
    } catch (error) {
        console.log(error);
    };

});

function validateList(list){
    const listSchema = Joi.object({
        name: Joi.string()
                 .required(),
        password:Joi.string()
                    .min(4)
                    .required(),
        email:Joi.string()
                 .required(),
    });

    return listSchema.validate(list);
};

app.listen(5555, (req, res) =>{
    console.log(`5555-port ishlayabdi`);
});