import * as gateway from '@safe-global/safe-gateway-typescript-sdk'
import { Web3Provider } from '@ethersproject/providers'
import type { JsonRpcSigner } from '@ethersproject/providers'

import { dispatchSafeMsgConfirmation, dispatchSafeMsgProposal } from '@/services/safe-messages/safeMsgSender'
import * as utils from '@/utils/safe-messages'
import * as events from '@/services/safe-messages/safeMsgEvents'
import { hexZeroPad } from 'ethers/lib/utils'

jest.mock('@safe-global/safe-gateway-typescript-sdk', () => ({
  ...jest.requireActual('@safe-global/safe-gateway-typescript-sdk'),
  proposeSafeMessage: jest.fn(),
  confirmSafeMessage: jest.fn(),
}))

describe('safeMsgSender', () => {
  const mockProvider = new Web3Provider(jest.fn())

  beforeEach(() => {
    jest.resetAllMocks()

    jest.spyOn(utils, 'generateSafeMessageHash').mockImplementation(() => '0x123')

    jest.spyOn(mockProvider, 'getSigner').mockImplementation(
      () =>
        ({
          _signTypedData: jest.fn().mockImplementation(() => Promise.resolve('0x456')),
        } as unknown as JsonRpcSigner),
    )
  })

  describe('dispatchSafeMsgProposal', () => {
    it('should dispatch a message proposal', async () => {
      const proposeSafeMessageSpy = jest.spyOn(gateway, 'proposeSafeMessage')
      proposeSafeMessageSpy.mockImplementation(() => Promise.resolve())

      const safeMsgDispatchSpy = jest.spyOn(events, 'safeMsgDispatch')

      const safe = {
        version: '1.3.0',
        chainId: 1,
        address: {
          value: '0x789',
        },
      } as unknown as gateway.SafeInfo
      const message = 'Hello world'
      const requestId = '0x123'
      const safeAppId = 1
      const signer = mockProvider.getSigner()

      await dispatchSafeMsgProposal({ signer, safe, message, requestId, safeAppId })

      expect(proposeSafeMessageSpy).toHaveBeenCalledWith(1, '0x789', {
        message,
        signature: '0x456',
        safeAppId,
      })

      expect(safeMsgDispatchSpy).toHaveBeenCalledWith(events.SafeMsgEvent.PROPOSE, {
        messageHash: '0x123',
        requestId,
      })
    })

    it('should normalize EIP712 messages', async () => {
      const proposeSafeMessageSpy = jest.spyOn(gateway, 'proposeSafeMessage')
      proposeSafeMessageSpy.mockImplementation(() => Promise.resolve())
      jest.spyOn(events, 'safeMsgDispatch')

      const safe = {
        version: '1.3.0',
        chainId: '1',
        address: {
          value: hexZeroPad('0x789', 20),
        },
      } as unknown as gateway.SafeInfo
      const message: {
        types: { [type: string]: { name: string; type: string }[] }
        domain: any
        message: any
        primaryType?: string
      } = {
        types: {
          Test: [{ name: 'test', type: 'string' }],
        },
        domain: {
          chainId: '1',
          name: 'TestDapp',
          verifyingContract: hexZeroPad('0x1234', 20),
        },
        message: {
          test: 'Hello World!',
        },
      }
      const requestId = '0x123'
      const safeAppId = 1
      const signer = mockProvider.getSigner()

      await dispatchSafeMsgProposal({ signer, safe, message, requestId, safeAppId })

      // Normalize message manually
      message.types['EIP712Domain'] = [
        { name: 'name', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ]
      message.primaryType = 'Test'

      expect(proposeSafeMessageSpy).toHaveBeenCalledWith('1', hexZeroPad('0x789', 20), {
        message,
        signature: '0x456',
        safeAppId,
      })
    })

    it('should dispatch a message proposal failure', async () => {
      const proposeSafeMessageSpy = jest.spyOn(gateway, 'proposeSafeMessage')
      proposeSafeMessageSpy.mockImplementation(() => Promise.reject(new Error('Example error')))

      const safeMsgDispatchSpy = jest.spyOn(events, 'safeMsgDispatch')

      const safe = {
        version: '1.3.0',
        chainId: 1,
        address: {
          value: '0x789',
        },
      } as unknown as gateway.SafeInfo
      const message = 'Hello world'
      const requestId = '0x123'
      const safeAppId = 1
      const signer = mockProvider.getSigner()

      try {
        await dispatchSafeMsgProposal({ signer, safe, message, requestId, safeAppId })
      } catch (e) {
        expect((e as Error).message).toBe('Example error')

        expect(proposeSafeMessageSpy).toHaveBeenCalledWith(1, '0x789', {
          message,
          signature: '0x456',
          safeAppId,
        })

        expect(safeMsgDispatchSpy).toHaveBeenCalledWith(events.SafeMsgEvent.PROPOSE_FAILED, {
          messageHash: '0x123',
          error: expect.any(Error),
        })
      }
    })
  })

  describe('dispatchSafeMsgConfirmation', () => {
    it('should dispatch a message proposal', async () => {
      const confirmSafeMessageSpy = jest.spyOn(gateway, 'confirmSafeMessage')
      confirmSafeMessageSpy.mockImplementation(() => Promise.resolve())

      const safeMsgDispatchSpy = jest.spyOn(events, 'safeMsgDispatch')

      const safe = {
        version: '1.3.0',
        chainId: 1,
        address: {
          value: '0x789',
        },
      } as unknown as gateway.SafeInfo
      const message = 'Hello world'
      const requestId = '0x123'
      const signer = mockProvider.getSigner()

      await dispatchSafeMsgConfirmation({ signer, safe, message, requestId })

      expect(confirmSafeMessageSpy).toHaveBeenCalledWith(1, '0x123', {
        signature: '0x456',
      })

      expect(safeMsgDispatchSpy).toHaveBeenCalledWith(events.SafeMsgEvent.CONFIRM_PROPOSE, {
        messageHash: '0x123',
        requestId,
      })
    })

    it('should dispatch a message proposal failure', async () => {
      const confirmSafeMessageSpy = jest.spyOn(gateway, 'confirmSafeMessage')
      confirmSafeMessageSpy.mockImplementation(() => Promise.reject(new Error('Example error')))

      const safeMsgDispatchSpy = jest.spyOn(events, 'safeMsgDispatch')

      const safe = {
        version: '1.3.0',
        chainId: 1,
        address: {
          value: '0x789',
        },
      } as unknown as gateway.SafeInfo
      const message = 'Hello world'
      const requestId = '0x123'
      const signer = mockProvider.getSigner()

      try {
        await dispatchSafeMsgConfirmation({ signer, safe, message, requestId })
      } catch (e) {
        expect((e as Error).message).toBe('Example error')

        expect(confirmSafeMessageSpy).toHaveBeenCalledWith(1, '0x123', {
          signature: '0x456',
        })

        expect(safeMsgDispatchSpy).toHaveBeenCalledWith(events.SafeMsgEvent.CONFIRM_PROPOSE_FAILED, {
          messageHash: '0x123',
          error: expect.any(Error),
        })
      }
    })
  })
})
