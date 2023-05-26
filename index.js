const express = require('express');
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



require('./controller/authcontroller')(app);
require('./controller/projectController')(app);
require('./controller/productcontroller')(app);


const port = 3002;
app.listen(port, () => {
  console.log(`Servidor backend escutando na porta ${port}`);
});