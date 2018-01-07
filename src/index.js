import React from 'react'
import ReactDOM from 'react-dom'
import poketype from 'pokemon-types'
import { connect, Provider } from 'react-redux'
import { createStore } from 'redux'
import classNames from 'classnames'

import './style.scss'

// action
const SELECT_POKE_TYPE = 'SELECT_POKE_TYPE'
const RESET_POKE_TYPE = 'RESET_POKE_TYPE'

const selectPokeType = typ => {
  return {
    type: SELECT_POKE_TYPE,
    selectedType: typ
  }
}

const resetPokeType = () => {
  return {
    type: RESET_POKE_TYPE
  }
}

// components
const PokeTypeButton = ({ disabled, selected, typ, onSelect }) => {
  const wrapperCn = classNames({
    'poke-type-button': true,
    [typ]: true,
    selected: selected(typ),
    disabled: disabled(typ)
  })

  return (
    <button
      className={wrapperCn}
      disabled={disabled(typ)}
      onClick={() => onSelect()}
    >
      {typ}
    </button>
  )
}

const mapStateToPropsPTB = state => {
  return {
    disabled: typ => !state.selection.has(typ) && state.selection.size === 2,
    selected: typ => state.selection.has(typ)
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

const mapDispatchToPropsRB = dispatch => {
  return {
    onClick: () => {
      dispatch(resetPokeType())
    }
  }
}

const ResetButton = connect(null, mapDispatchToPropsRB)(({ onClick }) => (
  <button className="poke-type-reset" onClick={onClick}>
    リセット
  </button>
))

const PokeTypeButtons = () => {
  const buttons = poketype.TypesList.map(typ => (
    <SelectablePokeTypeButton key={typ} typ={typ} />
  ))
  return <div className="poke-type-buttons">{buttons}</div>
}

const SelectablePokeTypeButtons = connect()(PokeTypeButtons)

const PokemonEffectivenessList = ({ effectivenesses }) => {
  const elems = effectivenesses.map(ef => {
    const cn = classNames({
      'poke-type-result': true,
      [ef.skillType]: true,
      ['val' + ef.value.toString().replace('.', '')]: true
    })
    return (
      <li className={cn} key={ef.skillType + '-' + ef.value}>
        <div className="poke-effectiveness-type">{ef.skillType}</div>
        <div className="poke-effectiveness-value">x {ef.value}</div>
      </li>
    )
  })
  return <ul className="poke-type-results">{elems}</ul>
}

const mapStateToPropsPEL = state => {
  return {
    effectivenesses: state.effectivenesses.filter(ef => ef.value !== 1)
  }
}

const FilteredPokemonEffectivenessList = connect(mapStateToPropsPEL)(
  PokemonEffectivenessList
)

const mapStateToPropsS = state => {
  return {
    selection: state.selection
  }
}

const Selection = connect(mapStateToPropsS)(({ selection }) => {
  const sels = [...selection].map(typ => {
    return <li key={typ}>{typ}</li>
  })
  return <ul>{sels}</ul>
})

// reducer
const getNextSelection = (current, typ) => {
  const nextSelection = new Set(current)
  if (nextSelection.has(typ)) {
    nextSelection.delete(typ)
  } else if (nextSelection.size < 2) {
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
    case RESET_POKE_TYPE:
      return {
        selection: new Set(),
        effectivenesses: []
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
      <div className="poke-type-wrapper">
        <SelectablePokeTypeButtons />
        <ResetButton />
        <FilteredPokemonEffectivenessList />
      </div>
    </Provider>
  )
}

const root = document.getElementById('root')
if (root) {
  ReactDOM.render(<App />, root)
}
