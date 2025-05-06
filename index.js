const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');  
require('dotenv').config();

const database = require('./config/database.js');

const systemConfig = require('./config/system.js');

const route = require('./routes/client/index.route.js');
const routeAdmin = require('./routes/admin/index.route.js');

database.connect();

const app = express();
const port = process.env.PORT ;

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', './views');
app.set('view engine', 'pug');

// App Locals variables
app.locals.prefixAdmin = systemConfig.prefixAdmin; 

app.use(express.static('public'));

// Routes
route(app);
routeAdmin(app);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


