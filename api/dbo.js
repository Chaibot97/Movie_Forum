import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:6886'
});

const DEFAULT_COUNT = 10;

export const getPopularMovies = async (count) => {
  const c = count ? count : DEFAULT_COUNT;
  try {
    const res = await instance.get(`/movies/${c}`);
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

export const getRecommendations = async (userID, count) => {
  const c = count ? count : DEFAULT_COUNT;
  try {
    const res = await instance.get(`/movies/${c}`);
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

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
  // const result = [
  //   {
  //     id: 1,
  //     email: 'sihan.sun@yale.edu',
  //     comment: 'such a good movie!'
  //   }, {
  //     id: 2,
  //     email: 'lizhou.cai@yale.edu',
  //     comment: 'I have watched this movie 10 times. Like it!'
  //   }, {
  //     id: 3,
  //     email: 'jiaqi.yang@yale.edu',
  //     comment: 'Worst movie I have ever seen...'
  //   }
  // ];

  // if (id && id != '') {
  //   const promise = new Promise((onSuccess,onError) => {
  //     onSuccess(result);
  //   });

  //   return await promise;
  // }
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
    const res = await instance.get(`/login/${userEmail}`);
    if (res.data.length === 0) {
      await instance.post(`register/${userEmail}`);
      console.log('register');
    } else {
      console.log('already registered');
    }
  } catch (error) {
    console.log(error);
  }
}

export default instance;