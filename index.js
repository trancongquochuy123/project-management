const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const flash = require('express-flash'); 
const cookieParser = require('cookie-parser'); 
const session = require('express-session');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

require('dotenv').config();

const database = require('./config/database.js');

const systemConfig = require('./config/system.js');

const route = require('./routes/client/index.route.js');
const routeAdmin = require('./routes/admin/index.route.js');

database.connect();

const app = express();
const port = process.env.PORT ;

// methodOverride
app.use(methodOverride('_method'));

// Express Flash, Cookie Parser, Session
app.use(cookieParser('huydeptrai'));
app.use(session({ cookie: { maxAge: 60000 }}));
app.use(flash());

// Tinymce
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

// App Locals variables
app.locals.prefixAdmin = systemConfig.prefixAdmin; 

app.use(express.static(`${__dirname}/public`));

// Routes
route(app);
routeAdmin(app);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


