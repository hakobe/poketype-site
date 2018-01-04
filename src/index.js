import React from 'react'
import ReactDOM from 'react-dom'
import poketype from 'pokemon-types'

const PokeTypeButton = ({ selection, typ, onSelect }) => {
  const className = selection.has(typ) ? 'selected' : ''
  return (
    <div key={typ} className={className} onClick={() => onSelect(typ)}>
      {typ}
    </div>
  )
}

const PokeTypeButtons = ({ selection, onSelect }) => {
  const buttons = poketype.TypesList.map(typ =>
    PokeTypeButton({
      typ: typ,
      selection: selection,
      onSelect: onSelect
    })
  )
  return <div>{buttons}</div>
}

const PokemonEffectivness = ({ effectiveness }) => {
  return (
    <li key={effectiveness.skillType + '-' + effectiveness.value}>
      {effectiveness.skillType} x{effectiveness.value}
    </li>
  )
}

const PokemonEffectivenessList = ({ effectivenesses }) => {
  const elems = effectivenesses
    .filter(ef => ef.value !== 1)
    .map(ef => PokemonEffectivness({ effectiveness: ef }))
  return <ul>{elems}</ul>
}

class App extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      selection: new Set(),
      effectivenesses: []
    }
  }
  onSelect(typ) {
    const nextSelection = new Set(this.state.selection)
    if (nextSelection.has(typ)) {
      nextSelection.delete(typ)
    } else if (nextSelection.size === 2) {
      nextSelection.clear()
    } else {
      nextSelection.add(typ)
    }

    if (nextSelection.size === 0) {
      this.setState({
        selection: nextSelection,
        effectivenesses: []
      })
      return
    }

    const target = poketype.createPokemon(...nextSelection.values())
    const nextEffectivenesses = poketype.TypesList.map(typ => {
      const ef = poketype.calcEffectiveness(typ, target)
      return {
        message: ef.message,
        value: ef.value,
        skillType: typ
      }
    })

    this.setState({
      selection: nextSelection,
      effectivenesses: nextEffectivenesses
    })
  }

  render() {
    return (
      <div>
        <PokeTypeButtons
          selection={this.state.selection}
          onSelect={this.onSelect.bind(this)}
        />
        <PokemonEffectivenessList
          effectivenesses={this.state.effectivenesses}
        />
      </div>
    )
  }
}

const root = document.getElementById('root')
if (root) {
  ReactDOM.render(<App />, root)
}
