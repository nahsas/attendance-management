import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb = typeof window !== 'undefined' && !window.navigator?.product;

const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql/',
});

const authLink = setContext(async (_, { headers }) => {
  let token = null;
  try {
    if (!isWeb && AsyncStorage) {
      token = await AsyncStorage.getItem('authToken');
    }
  } catch (e) {
    console.log('AsyncStorage not available');
  }
  return {
    headers: {
      ...headers,
      Authorization: token ? `JWT ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
