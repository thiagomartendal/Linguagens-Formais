function inicio() {
  let painelCentral = document.getElementById('painel-central')
  painelCentral.textContent = ''
}

function novoAutomato() {
  fetch('/novoAutomato', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nomeAutomato: document.querySelector('input[name="nome-automato"]').value,
      estadoInicial: document.querySelector('input[name="estado-inicial"]').value,
      estadosFinais: document.querySelector('input[name="estados-finais"]').value.split(' '),
      definicaoAutomato: document.querySelector('textarea[name="definicao-automato"]').value
    })
  }).then(res => res.json()).then(res => {
    let nomeAutomato = document.querySelector('input[name="nome-automato"]')
    let msgErro = document.getElementById('msg-erro')
    if (!res['nomeUnico']) {
      if (msgErro == null) {
        let novoAutomato = document.getElementById('novo-automato')
        let div = document.createElement('div')
        div.id = 'msg-erro'
        let h3 = document.createElement('h3')
        h3.style.color = 'red'
        h3.appendChild(document.createTextNode('O nome escolhido para o autômato já está em uso por outro componente.'))
        div.appendChild(document.createElement('br'))
        div.appendChild(h3)
        novoAutomato.appendChild(div)
        nomeAutomato.style.borderColor = 'red'
      }
    } else {
      if (msgErro != null) {
        msgErro.remove()
      }
      nomeAutomato.removeAttribute('style')
    }
  })
  listaItens()
}

function novaGramatica() {
  fetch('/novaGramatica', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nomeGramatica: document.querySelector('input[name="nome-gramatica"]').value,
      simbolosTerminais: document.querySelector('input[name="simbolos-terminais"]').value,
      simbolosNaoTerminais: document.querySelector('input[name="simbolos-nao-terminais"]').value.split(' '),
      definicaoGramatica: document.querySelector('textarea[name="definicao-gramatica"]').value
    })
  })
}

function listaItens() {
  fetch('/itens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json()).then(res => {
    let itens = document.getElementById('itens')
    itens.textContent = ''
    res.lista.forEach(item => {
      let novoItem = document.createElement('div')
      novoItem.className = 'item'
      let nomeItem = document.createElement('div')
      nomeItem.className = 'nome-item'
      nomeItem.appendChild(document.createTextNode(item.nome))
      novoItem.appendChild(nomeItem)
      let primeiroClique = true
      nomeItem.onclick = () => {
        if (primeiroClique) {
          novoItem.classList.remove('item')
          novoItem.classList.add('item-acessado')
          if (item.tipo == 'automato') {
            novoItem.appendChild(menuItemAutomato(item.nome))
          }
          primeiroClique = false
        } else {
          novoItem.classList.remove('item-acessado')
          novoItem.classList.add('item')
          novoItem.textContent = ''
          novoItem.appendChild(nomeItem)
          primeiroClique = true
        }
      }
      itens.appendChild(novoItem)
    })
  })
}

function menuItemAutomato(nomeAutomato) {
  let menu = document.createElement('div')
  menu.className = 'menu-item'
  let visualizar = document.createElement('input')
  visualizar.type = 'button'
  visualizar.value = 'Visualizar'
  visualizar.className = 'botao'
  visualizar.addEventListener('click', function(){
    let painelCentral = document.getElementById('painel-central')
    painelCentral.textContent = ''
    exibirAutomato(nomeAutomato)
  })
  let computar = document.createElement('input')
  computar.type = 'button'
  computar.value = 'Computar Sentença'
  computar.className = 'botao'
  computar.addEventListener('click', function(){
    alterarPainelCentral(1)
    let painel = document.getElementById('painel-central')
    let hidden = document.createElement('input')
    hidden.type = 'hidden'
    hidden.value = nomeAutomato
    painel.appendChild(hidden)
  })
  let determinizar = document.createElement('input')
  determinizar.type = 'button'
  determinizar.value = 'Determinizar'
  determinizar.className = 'botao'
  determinizar.addEventListener('click', function(){
    determinizarAutomato(nomeAutomato)
  })
  let excluir = document.createElement('input')
  excluir.type = 'button'
  excluir.value = 'Excluir'
  excluir.className = 'botao'
  excluir.addEventListener('click', function(){
    excluirAutomato(nomeAutomato)
  })
  menu.appendChild(visualizar)
  menu.appendChild(computar)
  menu.appendChild(determinizar)
  menu.appendChild(excluir)
  return menu
}

function semEspaco(event) {
  if (event.keyCode == 32) {
    event.preventDefault()
  }
}

function alterarPainelCentral(painel) {
  let painelCentral = document.getElementById('painel-central')
  painelCentral.textContent = ''
  let pagina = ''
  if (painel == 0) {
    pagina = 'novo_automato.html'
  } else if (painel == 1) {
    pagina = 'computar_sentenca.html'
  } else if (painel == 2) {
    pagina = 'nova_gramatica.html'
  }
  fetch(pagina).then(res => res.text()).then(conteudo => painelCentral.innerHTML += conteudo)
}

function computar(exibirResultado) {
  let sentenca = document.querySelector('input[name="sentenca"]')
  let arvoreComputacao = document.getElementById('arvore-computacao')
  arvoreComputacao.textContent = ''
  fetch('/computarSentenca', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      automato: document.querySelector('input[type="hidden"]').value,
      sentenca: sentenca.value
    })
  }).then(res => res.json()).then(res => {
    if (exibirResultado) {
      let resultadoComputacao = document.getElementById('resultado-computacao')
      let resultado = ((res.resultado) ? 'aceita' : 'rejeitada')
      resultadoComputacao.innerHTML = 'A sentença ' + sentenca.value + ' foi ' + resultado + ' pelo automato. <br /><br />'
    }
  })
}

function gerarArvoreComputacao() {
  computar(false)
  fetch('/gerarArvoreComputacao', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      automato: document.querySelector('input[type="hidden"]').value,
    })
  }).then(res => res.json()).then(res => {
    let arvore = res.arvore
    let arvoreComputacao = document.getElementById('arvore-computacao')
    arvoreComputacao.textContent = ''
    arvore.forEach((item, i) => {
      arvoreComputacao.innerHTML += '(' + item['e1'] + ', ' + item['s'] + ') => ' + item['e2']
      if (i < arvore.length-1) {
        arvoreComputacao.innerHTML += `<br />`
      }
    })
  })
}

function exibirAutomato(nomeAutomato) {
  let painelCentral = document.getElementById('painel-central')
  let div = document.createElement('div')
  div.id = 'exibicao-automato'
  let divNome = document.createElement('div')
  divNome.id = 'nome-automato'
  divNome.appendChild(document.createTextNode(nomeAutomato))
  div.appendChild(divNome)
  let divTabela = document.createElement('div')
  divTabela.id = 'exibicao-tabela'
  let tabela = document.createElement('table')
  tabela.border = 1
  fetch('/buscarAutomato', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      automato: nomeAutomato,
    })
  }).then(res => res.json()).then(res => {
    let simbolosTransicao = []
    let tr0 = document.createElement('tr')
    tr0.appendChild(document.createElement('td'))
    tabela.appendChild(tr0)
    res.simbolos.forEach(item => {
      let tdS = document.createElement('td')
      tdS.className = 'c0'
      tdS.appendChild(document.createTextNode(item))
      tr0.appendChild(tdS)
    })
    for (k in res.transicoes) {
      let tr1 = document.createElement('tr')
      let tdP = document.createElement('td')
      tdP.className = 'c0'
      if (res.estados[k] == 'I') {
        tdP.classList.add('inicial')
      } else if (res.estados[k] == 'IF') {
        tdP.classList.add('inicial-final')
      } else if (res.estados[k] == 'F') {
        tdP.classList.add('final')
      }
      tdP.appendChild(document.createTextNode(k))
      tr1.appendChild(tdP)
      res.simbolos.forEach(j => {
        let tdC = document.createElement('td')
        let chegada = ''
        if (res.transicoes[k][j] != null) {
          res.transicoes[k][j].forEach((item, i) => {
            chegada += item
            if (i < res.transicoes[k][j].length-1) {
              chegada += ','
            }
          })
        }
        tdC.appendChild(document.createTextNode(chegada))
        tr1.appendChild(tdC)
        tabela.appendChild(tr1)
      })
    }
  })
  divTabela.appendChild(tabela)
  div.appendChild(divTabela)
  painelCentral.appendChild(div)
}

function determinizarAutomato(nomeAutomato) {
  fetch('/determinizarAutomato', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      automato: nomeAutomato,
    })
  })
  caixaDeMensagem('Automato determinizado.')
}

function excluirAutomato(nomeComponente) {
  fetch('/excluirComponente', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nomeComponente: nomeComponente,
    })
  })
  listaItens()
  inicio()
  caixaDeMensagem('Automato excluído.')
}

function caixaDeMensagem(mensagem) {
  let section = document.querySelector('section')
  let lightbox = document.createElement('div')
  let conteudo = document.createElement('div')
  let botao = document.createElement('input')
  botao.type = 'button'
  botao.value = 'Fechar'
  botao.addEventListener('click', function() {
    document.querySelector('section .lightbox').remove()
  })
  conteudo.className = 'conteudo'
  conteudo.appendChild(document.createTextNode(mensagem))
  conteudo.appendChild(document.createElement('br'))
  conteudo.appendChild(document.createElement('br'))
  conteudo.appendChild(botao)
  lightbox.className = 'lightbox'
  lightbox.classList.add('show')
  lightbox.appendChild(conteudo)
  section.appendChild(lightbox)
}
