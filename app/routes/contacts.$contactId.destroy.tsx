import type { ActionFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'

import { deleteContact } from '../data'

// Adding a . to a route filename will create a / in the URL.
// URL: contacts/:id/destroy
export const action = async ({ params }: ActionFunctionArgs) => {
  invariant(params.contactId, 'Missing contactId param')
  await deleteContact(params.contactId)
  return redirect('/')
}
