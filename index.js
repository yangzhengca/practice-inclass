const express=require('express');
const app=express();
const mongoClient=require("mongodb").MongoClient;
// const ObjectID=require('mongodb').ObjectID
const ObjectID = require('mongodb').ObjectID;

const port=3000;
const dburl="mongodb://localhost:27017"

const bodyParser=require('body-parser');
const urlEncodeParser=bodyParser.urlencoded({extended:false});


// const superheros=[
//     { id:1,name: 'SPIDER-MAN'},
//     { id:2,name: 'CAPTAIN MARVEL' },
//     { id:3,name: 'HULK'},
//     { id:4,name: 'THOR' },
//     { id:5,name: 'IRON MAN' },
//     { id:6,name: 'DAREDEVIL' },
//     { id:7,name: 'BLACK WIDOW' },
//     { id:8,name: 'CAPTAIN AMERICA' },
//     { id:9,name: 'WOLVERINE' }
// ];

app.set('view engine','pug');

app.use(express.static('public'));

//home
app.get('/',function(req,res){  
    mongoClient.connect(dburl,function(err,client){
        const db=client.db('comics');
        const collection=db.collection('superheroes');

        collection.find({}).toArray((err,documents)=>{
            // console.log(documents);
            client.close();
            res.render('index',{mysuperheros:documents});
        });
    });    
});


// superhero details page
app.get('/superheros/:id/',function(req,res){
    const selectedId=req.params.id;

    mongoClient.connect(dburl,function(err,client){
        const db=client.db('comics');
        const collection=db.collection('superheroes');
        const filter={_id: ObjectID(selectedId)};
        collection.find(filter).toArray((err,documents)=>{
            var selectedSuperHero=documents[0]; 
            client.close();
            res.render('superhero',{superhero:selectedSuperHero}); 
        });          
    });
});




//create a new hero
app.post('/superheros/',urlEncodeParser,(req,res)=>{
    
    const newSuperhero={
        name:req.body.superhero,
        description:req.body.description,
        fav_season:req.body.season,
        fav_color:req.body.color
    };

    mongoClient.connect(dburl,function(err,client){
        const db=client.db('comics');
        const collection=db.collection('superheroes');
        collection.insertOne(newSuperhero,(err,result)=>{
            client.close();
            res.redirect('/');
        });
    });
});

//delete choosed hero
app.get('/delete/:id',function(req,res){
    const selectedId=req.params.id;
    mongoClient.connect(dburl,function(err,client){
        const db=client.db('comics');
        const collection=db.collection('superheroes');
        const filter={_id: ObjectID(selectedId)};
        collection.deleteOne(filter,(err,result)=>{
            client.close();
            res.redirect('/');
        });          
    });
});



//edit funtion
app.get('/edit/:id',function(req,res){
    const selectedId=req.params.id;
    mongoClient.connect(dburl,function(err,client){
        const db=client.db('comics');
        const collection=db.collection('superheroes');
        const filter={_id: ObjectID(selectedId)};
        collection.find(filter).toArray((err,documents)=>{
            var selectedSuperHero=documents[0]; 
            client.close();
        res.render('edit',{selectedSuperHero:selectedSuperHero});
        });
    });
});


app.post('/edit',urlEncodeParser,(req,res)=>{
    const selectedId=req.body._id;
    const filter={_id:ObjectID(selectedId)};
    const set={$set:{
        name:req.body.superhero,
        description:req.body.description,
        fav_season:req.body.season,
        fav_color:req.body.color
    }};
    // const selectedColor=req.body.color;
    mongoClient.connect(dburl,function(err,client){
        const db=client.db('comics');
        const collection=db.collection('superheroes');
        collection.updateOne(filter,set,(err,result)=>{
            client.close();
            res.redirect('/superheros/'+selectedId);
        });
    });
});



app.listen(port,()=>{
    console.log(`listening at port ${port}`)
});
