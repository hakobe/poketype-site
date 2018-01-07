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
const SELECT_MODE = 'SELECT_MODE'

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

const selectMode = mode => {
  return {
    type: SELECT_MODE,
    selectedMode: mode
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

const PokeTypeButtons = () => {
  const buttons = poketype.TypesList.map(typ => (
    <SelectablePokeTypeButton key={typ} typ={typ} />
  ))
  return <div className="poke-type-buttons">{buttons}</div>
}

const SelectablePokeTypeButtons = connect()(PokeTypeButtons)

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

const mapStateToPropsSM = state => {
  return {
    mode: state.mode
  }
}

const mapDispatchToPropsSM = dispatch => {
  return {
    onClick: mode => {
      dispatch(selectMode(mode))
    }
  }
}

const SelectModeButton = connect(mapStateToPropsSM, mapDispatchToPropsSM)(
  ({ mode, onClick }) => {
    const deffenceCn = classNames({
      defence: true,
      active: mode === 'defence'
    })
    const offenceCn = classNames({
      offence: true,
      active: mode === 'offence'
    })
    return (
      <div className="poke-mode-select">
        <div className="msg">選択したタイプで...</div>
        <button className={deffenceCn} onClick={() => onClick('defence')}>
          ぼうぎょ
        </button>
        <button className={offenceCn} onClick={() => onClick('offence')}>
          こうげき
        </button>
      </div>
    )
  }
)

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

const calcEffectivenessesAsDefence = selection => {
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

const calcEffectivenessesAsOffence = selection => {
  if (selection.size !== 1) {
    return []
  }

  return poketype.TypesList.map(typ => {
    const target = poketype.createPokemon(typ)
    const ef = poketype.calcEffectiveness([...selection][0], target)
    return {
      message: ef.message,
      value: ef.value,
      skillType: typ
    }
  })
}

const calcEffectivenesses = (selection, mode) => {
  if (selection.size === 0) {
    return []
  }

  return (mode === 'defence'
    ? calcEffectivenessesAsDefence(selection)
    : calcEffectivenessesAsOffence(selection)
  ).filter(e => e.value !== 1)
}

const mapStateToPropsPEL = state => {
  return {
    effectivenesses: calcEffectivenesses(state.selection, state.mode)
  }
}

const FilteredPokemonEffectivenessList = connect(mapStateToPropsPEL)(
  PokemonEffectivenessList
)

// reducer

const getNextSelection = (current, typ, mode) => {
  const nextSelection = new Set(current)
  if (mode === 'defence') {
    if (nextSelection.has(typ)) {
      nextSelection.delete(typ)
    } else if (nextSelection.size < 2) {
      nextSelection.add(typ)
    }
  } else {
    // offence
    if (nextSelection.has(typ)) {
      nextSelection.delete(typ)
    } else {
      nextSelection.clear()
      nextSelection.add(typ)
    }
  }
  return nextSelection
}

const app = (state = { selection: new Set(), mode: 'defence' }, action) => {
  switch (action.type) {
    case SELECT_POKE_TYPE:
      const nextSelection = getNextSelection(
        state.selection,
        action.selectedType,
        state.mode
      )

      return {
        ...state,
        selection: nextSelection
      }
    case RESET_POKE_TYPE:
      return {
        ...state,
        selection: new Set()
      }
    case SELECT_MODE:
      return {
        ...state,
        selection: new Set(),
        mode: action.selectedMode
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
        <SelectModeButton />
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
