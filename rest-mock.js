const http = require('http');
const fs = require('fs');
const statusCode = process.argv[2] || "200";

const jsonFile = (filePath) => {
  const rawSamples = fs.readFileSync(filePath);
  return JSON.parse(rawSamples);
}   

const samples = () => jsonFile(`samples-flex.json`);

const tokenResponse = {
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJtb2JpbGVfYXBwIiwib3Blbi1hcGkiXSwiZXhwIjoxNTk2MTg0OTI1LCJqdGkiOiIyNGJmZmM0OS03MDFjLTQ0ZTItYTg5Zi04MjcyZThlMDM4M2MiLCJjbGllbnRfaWQiOiJBQlRyNFlWRmhhczhZZnExdUdmUiJ9.bjj4sX0QcLMjYzk1gY90W7s1Dtud8WFJO53H8w-wado",
  "token_type": "bearer",
  "expires_in": 43199,
  "scope": "mobile_app open-api",
  "jti": "24bffc49-701c-44e2-a89f-8272e8e0383c"
}

const okResponses =[
{
  uri:/^.*closure\/transfer\/\w+$/,
  body: () => ({id: `${Math.floor(Math.random() * 9000) + 1000}` }),
  method: /POST/
},
{
  uri:/^.*token$/,
  body: () => tokenResponse,
  method: /POST/
},
{
  uri:/^\/business-manager\/services\/accounts\/\w+$/,
  body: () => samples().accounts,
  method: /GET/
},
{
  uri:/^\/business-manager\/services\/clients\/$/,
  body: () => samples().accountCreation,
  method: /POST/
},
{
  uri:/^\/business-manager\/services\/accounts\/\w+$/,
  body: () => samples().createPocket,
  method: /POST/
},
{
  uri:/^\/business-manager\/services\/accounts\/\w+\/movements\/\w+?.*$/,
  body: () => samples().pocketMovements,
  method: /GET/
},
{
  uri:/^\/business-manager\/services\/accounts\/\w+\/statements\/\w+$/,
  body: () => {
    const nuSamples = samples();
    const size = Math.floor(Math.random() * 12) + 1;
    const randomTransactions = nuSamples.allTranctions.sort(() => .5 - Math.random()).slice(0, size)
    return {
      ...nuSamples.accountsStatements,
      transactions : randomTransactions
    }
  },
  method: /POST/
},
{
  uri:/^\/business-manager\/services\/accounts\/\w+\/certificate\/\w+$/,
  body: () => samples().accountCertificate,
  method: /GET/
},,
{
  uri:/^\/business-manager\/services\/common\/config$/,
  body: () => samples().config,
  method: /GET/
},
];

const okResponseMapper = (uri, method) => {
  const response = okResponses.filter(mock => mock.uri.test(uri) && mock.method.test(method))
  return response.length ? response[0].body() : {id:"1234"};
};

const app = http.createServer(function(req,res){
  console.log("\n", new Date().toLocaleString());
  console.log(req.method);
  console.log(req.url);

  if (/POST/.test(req.method)) {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => console.log('Data: ', Buffer.concat(chunks).toString()))
  }

  const response = okResponseMapper(req.url, req.method);
  console.log(response)
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = statusCode;
  res.end(JSON.stringify(response));
});

app.listen(8888, () => {
  console.log(new Date().toLocaleString());
  console.log("Starting server in port 8888\n");
});