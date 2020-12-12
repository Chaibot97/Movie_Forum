import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:6886'
});

const DEFAULT_COUNT = 50;

export const getPopularMovies = async (count) => {
  const c = count ? count : DEFAULT_COUNT;
  try {
    const res = await instance.get(`/movies/${c}`);
    console.log('popular!')
    console.log(res);
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const getHighestRatedMovies = async (count) => {
  const c = count ? count : DEFAULT_COUNT;
  try {
    const res = await instance.get(`/movies/rating/${c}`);
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const searchMovieById = async (id) => {
  if (id) {
    try {
      const res = await instance.get(`/movie/${id}`);
      return res.data;
    } catch (error) {
      console.log(error);
      return []
    }
  }
}

export const searchMovieByName = async (key, count) => {
  const c = count ? count : DEFAULT_COUNT;

  if (key && key !== '') {
    try {
      const res = await instance.get(`/movies/${key.toLowerCase()}/${c}`);
      return res.data;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}

export const searchMovieByActorName = async (key, count) => {
  const c = count ? count : DEFAULT_COUNT;

  if (key && key !== '') {
    
    try {
      const res = await instance.get(`movies/actor/${key.toLowerCase()}/${c}`);
      return res.data;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}

export const getCommentsByMovieId = async (id) => {
  if (id && id !== '') {
    try {
      const res = await instance.get(`/review/${id}`);
      console.log()
      return res.data;
    } catch (err) {
      return [];
    }
  }
}

export const postComment = async (movieId, userEmail, comment ) => {
  try {
    await instance.post(`/review/add/${movieId}/${comment}/${userEmail}`);
  } catch (error) {
    console.log(error);
  }
}

export const loginUserDB = async (userEmail) => {
  try {
    let res = await instance.get(`/login/${userEmail}`);
    if (res.data.length === 0) {
      res = await instance.post(`/register/${userEmail}`);
    } 
    
    return { id: res.data[0].id };
  } catch (error) {
    return { error };
  }
}

export const likeMovie = async (userId, movieId) => {
  console.log(userId);
  try {
    await instance.post(`/like/${movieId}/${userId}`);
    console.log('liked!');
  } catch (error) {
    console.log(error);
  }
}

export const dislikeMovie = async (userId, movieId) => {
  try {
    await instance.post(`/unlike/${movieId}/${userId}`);
    console.log('unliked');
  } catch (error) {
    console.log(error);
  }
}

export const getUserLikes = async (userId) => {
  try {
    const res = await instance.get(`/likes/${userId}`);
    console.log(res);
    return res.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export default instance;