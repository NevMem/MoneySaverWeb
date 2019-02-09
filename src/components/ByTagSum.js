import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class ByTagSum extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    countOfDays: PropTypes.number.isRequired
  }

  render() {
    return (
      <div className = 'by-tag-card'>
        <h2>Полная сумма по каждому тегу</h2>
        <table className = 'main-info'>
          <thead>
            <tr>
              <td width = '33%'>Тег</td>
              <td width = '33%'>Сумма</td>
              <td width = '33%'>Средний расход в день</td>
            </tr>
          </thead>
          <tbody>
            {this.props.data.map((el, key) => {
              return (
                <tr key = {key}>
                  <td>{el.label}</td>
                  <td>{el.value}</td>
                  <td>{(el.value / this.props.countOfDays * 100 | 0) / 100.}</td>
                </tr>
              )
          })}
          </tbody>
        </table>
      </div>
    )
  }
}