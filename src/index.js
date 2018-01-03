import React from 'react'
import ReactDOM from 'react-dom'
import poketype from 'pokemon-types'

const PokeTypeButton = props => {
  const className = props.selection.has(props.type) ? 'selected' : ''
  return (
    <div
      key={props.type}
      className={className}
      onClick={() => props.onSelect(props.type)}
    >
      {props.type}
    </div>
  )
}

const PokeTypeButtons = props => {
  const buttons = poketype.TypesList.map(typ =>
    PokeTypeButton({
      type: typ,
      selection: props.selection,
      onSelect: props.onSelect
    })
  )
  return <div>{buttons}</div>
}

const PokemonEffectivness = props => {
  const ef = props.effectiveness
  return (
    <li key={ef.skillType + '-' + ef.value}>
      {ef.skillType} x{ef.value}
    </li>
  )
}

const PokemonEffectivenessList = props => {
  const elems = props.effectivenesses
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
