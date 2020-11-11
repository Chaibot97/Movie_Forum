import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:6886'
});

export const getPopularMovies = async (count) => {
  const c = count ? count : 6;
  try {
    const res = await instance.get(`/movies/${c}`);
    return res.data;
  } catch (err) {
    return [];
  }
};

export const getHighestRatedMovies = async (count) => {
  const c = count ? count : 6;
  try {
    const res = await instance.get(`/movies/${c}`);
    return res.data;
  } catch (err) {
    return [];
  }
};

export const getRecommendations = async (userID, count) => {
  const c = count ? count : 6;
  try {
    const res = await instance.get(`/movies/${c}`);
    return res.data;
  } catch (err) {
    return [];
  }
};

export const searchMovieByKey = async (key, category, count) => {
  const c = count ? count : 6;

  if (key && key !== '') {
    try {
      const res = await instance.get(`/movies/${c}`);
      return res.data;
    } catch (err) {
      return [];
    }
  }
}

export default instance;