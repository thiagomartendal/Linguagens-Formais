const Item = require('./item.js')

module.exports = class Automato extends Item {
  #estadoInicial
  #estados
  #simbolos
  #transicoes
  #arvore
  #fecho

  constructor() {
    super()
    this.#estados = {} // [estado] = tipo => I = inicial | N = normal | F = final | IF = inicial e final
    this.#transicoes = {}
    this.#simbolos = []
    this.#fecho = {}
  }

  definir(descricao) {
    let str = descricao.trim().split(/[\s,]+/)
    if (str.length % 3 == 0) {
      for (let i = 0; i < str.length; i++) {
        if ((i+1) % 3 == 0) {
          let estado1 = str[i-2]
          let simbolo = str[i-1]
          let estado2 = str[i]
          this.inserirEstado(estado1, 'N')
          this.inserirEstado(estado2, 'N')
          this.inserirTransicao(estado1, simbolo, estado2)
        }
      }
      return true
    }
    return false
  }

  inserirEstado(estado, tipo) {
    if (this.#estados[estado] == null) {
      if (tipo == 'I' || tipo == 'IF') {
        this.#estadoInicial = estado
      }
      this.#estados[estado] = tipo
    }
  }

  inserirTransicao(estado1, simbolo, estado2) {
    if (this.#transicoes[estado1] == null) {
      this.#transicoes[estado1] = {}
      this.#transicoes[estado1][simbolo] = [estado2]
      if (!this.#simbolos.includes(simbolo)) {
        this.#simbolos.push(simbolo)
      }
    } else {
      if (this.#transicoes[estado1][simbolo] == null) {
        this.#transicoes[estado1][simbolo] = [estado2]
        if (!this.#simbolos.includes(simbolo)) {
          this.#simbolos.push(simbolo)
        }
      } else {
        if (!this.#transicoes[estado1][simbolo].includes(estado2)) {
          this.#transicoes[estado1][simbolo].push(estado2)
          this.#transicoes[estado1][simbolo].sort()
        }
      }
    }
  }

  avaliarSentenca(sentenca) {
    let resultados = []
    this.#arvore = []
    this.#transicionar(sentenca, this.#estadoInicial, resultados)
    return resultados.includes(true)
  }

  #transicionar(sentenca, estadoAtual, resultados) {
    if (sentenca != '') {
      let simbolo = sentenca[0]
      if (this.#transicoes[estadoAtual][simbolo] != null) {
        if (this.#transicoes[estadoAtual][simbolo].length == 1) {
          let chegada = this.#transicoes[estadoAtual][simbolo][0]
          this.#arvore.push({e1: estadoAtual, s: simbolo, e2: chegada})
          let resultado = this.#transicionar(sentenca.slice(1), chegada, resultados)
          resultados.push(resultado)
          return resultado
        } else {
          this.#transicoes[estadoAtual][simbolo].forEach(item => {
            this.#arvore.push({e1: estadoAtual, s: simbolo, e2: item})
            if (this.#transicionar(sentenca.slice(1), item, resultados)) {
              resultados.push(true)
              return true
            }
          })
        }
      } else {
        this.#arvore.push({e1: estadoAtual, s: simbolo, e2: ''})
      }
    } else {
      let resultado = (this.#estados[estadoAtual] == 'IF' || this.#estados[estadoAtual] == 'F')
      resultados.push(resultado)
      return resultado
    }
    resultados.push(false)
    return false
  }

  #iniciarFecho() {
    for (k in this.#estados) {
      this.#fecho[k] = [k]
      this.#calcularFecho(k, k)
    }
  }

  #calcularFecho(estadoFecho, estadoAtual) {
    // console.log(estadoAtual, this.#transicoes[estadoAtual])
    if (this.#transicoes[estadoAtual] != null && this.#transicoes[estadoAtual]['&'] != null) {
      this.#transicoes[estadoAtual]['&'].forEach(estado => {
        if (!this.#fecho[estadoFecho].includes(estado)) {
          this.#fecho[estadoFecho].push(estado)
          this.#fecho[estadoFecho].sort()
          this.#calcularFecho(estadoFecho, estado)
        }
      })
    }
  }

  #formarEstado(novoAutomato, conjuntoFormador) {
    let estado = ''
    let tipo = 'N'
    let formadores = []
    conjuntoFormador.forEach(item => {
      this.#fecho[item].forEach(item2 => {
        if (!formadores.includes(item2)) {
          estado += item2
          formadores.push(item2)
          if (this.#estados[item2] == 'IF' && novoAutomato.inicial == null) {
            tipo = 'IF'
          } else if (this.#estados[item2] == 'I' && tipo != 'IF' && novoAutomato.inicial == null) {
            tipo = 'I'
          } else if (this.#estados[item2] == 'F' && tipo != 'IF') {
            if (tipo == 'I' && novoAutomato.inicial == null) {
              tipo = 'IF'
            } else {
              tipo = 'F'
            }
          }
        }
      })
    })
    formadores.sort()
    return {estado, tipo, formadores}
  }

  #determinizacaoRecursiva(novoAutomato, estadoAtual) {
    let chegada = {}
    estadoAtual.formadores.forEach(item => {
      for (let j in this.#transicoes[item]) {
        if (j != '&') {
          if (chegada[j] == null) {
            chegada[j] = []
          }
          chegada[j].push(this.#formarEstado(novoAutomato, this.#transicoes[item][j]))
        }
      }
    })

    let formadores = {}
    for (let k in chegada) {
      if (formadores[k] == null) {
        formadores[k] = []
      }
      chegada[k].forEach(item => {
        item.formadores.forEach(item2 => {
          if (!formadores[k].includes(item2)) {
            formadores[k].push(item2)
            formadores[k].sort()
          }
        })
      })
    }

    for (let k in formadores) {
      let estadoChegada = this.#formarEstado(novoAutomato, formadores[k])
      novoAutomato.inserirTransicao(estadoAtual.estado, k, estadoChegada.estado)
      if (novoAutomato.estados[estadoChegada.estado] == null) {
        novoAutomato.inserirEstado(estadoChegada.estado, estadoChegada.tipo)
        this.#determinizacaoRecursiva(novoAutomato, estadoChegada)
      }
    }
  }

  determinizar() {
    // novasTransicoes = {}
    this.#iniciarFecho()
    let novoAutomato = new Automato()
    let novoEstado = this.#formarEstado(novoAutomato, [this.#estadoInicial])

    novoAutomato.inserirEstado(novoEstado.estado, novoEstado.tipo)

    this.#determinizacaoRecursiva(novoAutomato, novoEstado)

    // console.log(formadores)

    // for (let k in this.#transicoes) {
    //   for (let j in this.#transicoes[k]) {
    //     if (j != '&') {
    //       console.log(this.#formarEstado([k]).estado)
    //       console.log(this.#formarEstado(this.#transicoes[k][j]).estado)
    //       novoAutomato.inserirTransicao(this.#formarEstado([k]).estado, j, this.#formarEstado(this.#transicoes[k][j]).estado)
    //       // this.#transicoes[k][j].forEach(i => {
    //       //   // console.log(k, j, i, novosEstados[i])
    //       //   novoAutomato.inserirTransicao(novosEstados[k], j, novosEstados[i])
    //       // })
    //     }
    //   }
    // }
    return novoAutomato
  }

  get inicial() {
    return this.#estadoInicial
  }

  get estados() {
    return this.#estados
  }

  get simbolos() {
    this.#simbolos.sort()
    return this.#simbolos
  }

  get transicoes() {
    return this.#transicoes
  }

  get arvoreComputacao() {
    return this.#arvore
  }

  get efecho() {
    // if (this.#fecho == {}) {
    //   console.log('AQUI')
    // }
    this.#iniciarFecho()
    return this.#fecho
  }

  get json() {
    this.#simbolos.sort()
    return {estados: this.#estados, simbolos: this.#simbolos, transicoes: this.#transicoes, tipo: 'automato'}
  }
}
