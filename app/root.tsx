import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import type { LinksFunction } from '@remix-run/node'

import {
  Form,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from '@remix-run/react'

import appStylesHref from './app.css'

import { createEmptyContact, getContacts } from './data'
import { useEffect, useRef } from 'react'

// The browser will serialize the form's data automatically and send it to the server as the request body for POST, and as URLSearchParams for GET.
// Remix uses client side routing and sends it to the route's `action` function.
// `action` function handels
export const action = async () => {
  const contact = await createEmptyContact()
  return redirect(`/contacts/${contact.id}/edit`)
  // return json({ contact })
}

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: appStylesHref }]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')
  const contacts = await getContacts(q)
  return json({ contacts, q })
}

// It serves as the root layout of the entire app, all other routes will render inside the <Outlet />.
export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  // The submit function will serialize and submit any form you pass to it.
  const submit = useSubmit()
  const inputRef = useRef<HTMLInputElement>()
  const searching = navigation.location && new URLSearchParams(navigation.location.search).has('q')

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = q || ''
    }
  }, [q])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form
              id="search-form"
              role="search"
              onChange={event => {
                const isFirstSearch = q === null
                // Now the first search will add a new entry, but every keystroke after that will replace the current entry
                submit(event.currentTarget, {
                  replace: !isFirstSearch,
                })
              }}>
              <input
                ref={inputRef}
                id="q"
                aria-label="Search contacts"
                className={searching ? 'loading' : ''}
                placeholder="Search"
                type="search"
                name="q"
                defaultValue={q || ''}
              />
              <div id="search-spinner" aria-hidden hidden={!searching} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map(contact => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) => (isActive ? 'active' : isPending ? 'pending' : '')}
                      to={`contacts/${contact.id}`}>
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{' '}
                      {contact.favorite ? <span>★</span> : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        {/* avoid fading out the main screen when searching */}
        <div id="detail" className={navigation.state === 'loading' && !searching ? 'loading' : ''}>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
