'use client';

import { Circle, Spinner } from '@chakra-ui/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BiCamera } from 'react-icons/bi';
import { storage } from '../firebase.config';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import postMethod from 'helpers/postMethod';

const AvatarPicker = ({ profileId, avatar }) => {
  const prevUrl = useRef();
  const { register, watch } = useForm({});
  const [isLoading, setIsLoading] = useState(false);
  const file = watch('avatar');

  useEffect(() => {
    const handleUpload = async () => {
      if (file?.[0] && file instanceof FileList) {
        setIsLoading(true);
        const imagesRef = ref(storage, `${profileId}/avatar`);
        const upload = await uploadBytes(imagesRef, file[0]);
        const publicURL = await getDownloadURL(upload.ref);
        await postMethod({
          path: '/api/postAvatar',
          data: {
            profileId,
            publicURL,
          },
        });
        setIsLoading(false);
      }
    };
    handleUpload();
  }, [file?.[0]]);

  const avatarURL = useMemo(() => {
    if (file?.[0]) {
      if (file instanceof FileList) {
        return URL.createObjectURL(file[0]);
      }
    }
  }, [file]);

  return (
    <Circle
      as="label"
      border="1px solid"
      borderColor="gray.500"
      borderRadius="50%"
      size="6em"
      overflow="hidden"
      role="button"
      bgImage={!isLoading && `url(${avatarURL ?? avatar})`}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
    >
      {!avatarURL && !avatar && <BiCamera size="1.375em" color="gray" />}
      {isLoading && <Spinner />}
      <input
        type="file"
        accept="image/*"
        hidden
        ref={prevUrl}
        {...register('avatar')}
      />
    </Circle>
  );
};

export default AvatarPicker;
