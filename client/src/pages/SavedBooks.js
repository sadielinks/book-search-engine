import React from 'react';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';

// removed getMe + deleteBook } from utils/API
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

// import useQuery + useMutation
import { useQuery, useMutation } from '@apollo/client';
// import from queries.js instead
import { GET_ME } from '../utils/queries';
// import for mutations.js use
import { REMOVE_BOOK } from '../utils/mutations';

const SavedBooks = () => {
  // removed state from *here*
  // removed useEffect()

  // useQuery instead
  const { loading, data } = useQuery(GET_ME);
  const userData = data?.me || {};

  // useMutation w/ REMOVE_BOOK
  const [removeBook] = useMutation(REMOVE_BOOK);

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    // try catch for removal
    try {
      await removeBook({
        variables: { bookId }
      });

      // upon success, remove book's id from localStorage
      removeBookId(bookId);
      // window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  // removed previous userDataLength with loading
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <CardColumns>
          {userData.savedBooks.map((book) => {
            return (
              <Card key={book.bookId} border='dark'>
                {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;
