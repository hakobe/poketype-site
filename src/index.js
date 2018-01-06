import React from 'react'
import ReactDOM from 'react-dom'
import poketype from 'pokemon-types'
import { connect, Provider } from 'react-redux'
import { createStore } from 'redux'

// action
const SELECT_POKE_TYPE = 'SELECT_POKE_TYPE'

const selectPokeType = typ => {
  return {
    type: SELECT_POKE_TYPE,
    selectedType: typ
  }
}

// components
const PokeTypeButton = ({ selection, typ, onSelect }) => {
  const className = selection.has(typ) ? 'selected' : ''
  return (
    <div className={className} onClick={() => onSelect()}>
      {typ}
    </div>
  )
}

const mapStateToPropsPTB = state => {
  return {
    selection: state.selection
  }
}

const mapDispatchToPropsPTB = (dispatch, ownProps) => {
  return {
    onSelect: () => {
      dispatch(selectPokeType(ownProps.typ))
    }
  }
}

const SelectablePokeTypeButton = connect(
  mapStateToPropsPTB,
  mapDispatchToPropsPTB
)(PokeTypeButton)

const PokeTypeButtons = () => {
  const buttons = poketype.TypesList.map(typ => (
    <SelectablePokeTypeButton key={typ} typ={typ} />
  ))
  return <div>{buttons}</div>
}

const SelectablePokeTypeButtons = connect()(PokeTypeButtons)

const PokemonEffectivness = ({ effectiveness }) => {
  return (
    <li key={effectiveness.skillType + '-' + effectiveness.value}>
      {effectiveness.skillType} x{effectiveness.value}
    </li>
  )
}

const PokemonEffectivenessList = ({ effectivenesses }) => {
  const elems = effectivenesses.map(ef =>
    PokemonEffectivness({ effectiveness: ef })
  )
  return <ul>{elems}</ul>
}

const mapStateToPropsPEL = state => {
  return {
    effectivenesses: state.effectivenesses.filter(ef => ef.value !== 1)
  }
}

const FilteredPokemonEffectivenessList = connect(mapStateToPropsPEL)(
  PokemonEffectivenessList
)

// reducer
const getNextSelection = (current, typ) => {
  const nextSelection = new Set(current)
  if (nextSelection.has(typ)) {
    nextSelection.delete(typ)
  } else if (nextSelection.size === 2) {
    nextSelection.clear()
  } else {
    nextSelection.add(typ)
  }
  return nextSelection
}

const calcEffectivenesses = selection => {
  if (selection.size === 0) {
    return []
  }

  const target = poketype.createPokemon(...selection.values())
  return poketype.TypesList.map(typ => {
    const ef = poketype.calcEffectiveness(typ, target)
    return {
      message: ef.message,
      value: ef.value,
      skillType: typ
    }
  })
}

const app = (state = { selection: new Set(), effectivenesses: [] }, action) => {
  switch (action.type) {
    case SELECT_POKE_TYPE:
      const nextSelection = getNextSelection(
        state.selection,
        action.selectedType
      )

      return {
        selection: nextSelection,
        effectivenesses: calcEffectivenesses(nextSelection)
      }
    default:
      return state
  }
}

// main
const store = createStore(app)

const App = () => {
  return (
    <Provider store={store}>
      <div>
        <SelectablePokeTypeButtons />
        <FilteredPokemonEffectivenessList />
      </div>
    </Provider>
  )
}

const root = document.getElementById('root')
if (root) {
  ReactDOM.render(<App />, root)
}
