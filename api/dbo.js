import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:6886'
});

export const getPopularMovies = async (count) => {
  const c = count ? count : 20;
  try {
    const res = await instance.get(`/movies/${c}`);
    return res.data;
  } catch (err) {
    return [];
  }
};

export const getHighestRatedMovies = async (count) => {
  const c = count ? count : 20;
  try {
    const res = await instance.get(`/movies/rating/${c}`);
    return res.data;
  } catch (err) {
    return [];
  }
};

export const getRecommendations = async (userID, count) => {
  const c = count ? count : 20;
  try {
    const res = await instance.get(`/movies/${c}`);
    return res.data;
  } catch (err) {
    return [];
  }
};

export const searchMovieByKey = async (key, category, count) => {
  const c = count ? count : 20;

  if (key && key !== '') {
    try {
      const res = await instance.get(`/movies/${key}/${c}`);
      return res.data;
    } catch (err) {
      return [];
    }
  }
}

export const getCommentsByMovieId = async (id) => {
  const result = [
    {
      id: 1,
      email: 'sihan.sun@yale.edu',
      comment: 'such a good movie!'
    }, {
      id: 2,
      email: 'lizhou.cai@yale.edu',
      comment: 'I have watched this movie 10 times. Like it!'
    }, {
      id: 3,
      email: 'jiaqi.yang@yale.edu',
      comment: 'Worst movie I have ever seen...'
    }
  ];

  if (id && id != '') {
    const promise = new Promise((onSuccess,onError) => {
      onSuccess(result);
    });

    return await promise;
  }
}

export const postComment = async (userId, movieId) => {
  const promise = new Promise((onSuccess, onError) => {
    onSuccess(true);
  })
  return await promise;
}

export default instance;