import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import Toast from '/@/components/toast.vue'

describe('toast', () => {
  it('show', () => {
    const wrapped = shallowMount(Toast, {
      props: {
        show: true
      }
    })

    expect(wrapped.isVisible()).to.be.true

    wrapped.find('button').trigger('click')

    expect(wrapped.emitted()).to.have.property('close')
  })
})
