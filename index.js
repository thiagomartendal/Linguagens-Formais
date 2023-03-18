const express = require('express')
const app = express()

app.use(express.json())

var itens = {}

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html')
})

app.use(express.static(__dirname + '/public'))

app.post('/novoAutomato', function(req, res) {
  const Automato = require('./modulos/automato.js')
  let nomeAtm = req.body['nomeAutomato']
  let nomeAceito = false
  if (itens[nomeAtm] == null) {
    let estadoInicial = req.body['estadoInicial']
    let estadosFinais = req.body['estadosFinais']
    let defAtm = req.body['definicaoAutomato']
    let atm = new Automato()
    let tipoInicial = ((estadosFinais.includes(estadoInicial)) ? 'IF' : 'I')
    atm.inserirEstado(estadoInicial, tipoInicial)
    estadosFinais.forEach(item => {
      atm.inserirEstado(item, 'F')
    })
    atm.definir(defAtm)
    itens[nomeAtm] = atm
    nomeAceito = true
  }
  res.send({nomeUnico: nomeAceito})
})

app.post('/itens', function(req, res) {
  let listaItens = []
  for (k in itens) {
    let json = itens[k].json
    json.nome = k
    listaItens.push(json)
  }
  res.send({lista: listaItens})
})

app.post('/computarSentenca', function(req, res) {
  let automato = req.body['automato']
  let sentenca = req.body['sentenca']
  res.send({resultado: itens[automato].avaliarSentenca(sentenca)})
})

app.post('/gerarArvoreComputacao', function(req, res) {
  let automato = req.body['automato']
  res.send({arvore: itens[automato].arvoreComputacao})
})

app.post('/buscarAutomato', function(req, res) {
  let automato = req.body['automato']
  res.send(itens[automato].json)
})

app.post('/determinizarAutomato', function(req, res) {
  let automato = req.body['automato']
  itens[automato] = itens[automato].determinizar()
})

app.post('/excluirComponente', function(req, res) {
  let componente = req.body['nomeComponente']
  delete itens[componente]
})

app.post('/novaGramatica', function(req, res) {
  
})

app.listen(4000)
