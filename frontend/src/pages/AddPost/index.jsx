import React, {createRef, useCallback, useEffect, useMemo, useState} from 'react';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import SimpleMDE from 'react-simplemde-editor';
import {selectIsAuth} from "../../redux/slices/auth";
import {useSelector} from "react-redux";
import {Navigate, useNavigate, useParams} from "react-router-dom";

import 'easymde/dist/easymde.min.css';
import styles from './AddPost.module.scss';
import axios from "../../axios";


export const AddPost = () => {
    const {id} = useParams();
    const isAuth = useSelector(selectIsAuth);
    const navigate = useNavigate();
    const [imageUrl, setImageUrl] = useState('');
    const [text, setText] = useState('');
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState('');
    const [isLoading, setLoading] = useState(false);
    const inputFileRef = createRef();
    const isEditing = Boolean(id);

    const handleChangeFile = async (evt) => {
        try {
            const formData = new FormData();
            formData.append('image', evt.target.files[0]);

            const {data} = await axios.post('/upload', formData);

            setImageUrl(data.url);
        } catch (e) {
            console.warn(e);
            alert('Ошибка загрузки файла');
        }
    };

    const onClickRemoveImage = () => {
        setImageUrl('');
    };

    const onChange = useCallback((value) => {
        setText(value);
    }, []);

    const options = useMemo(
        () => ({
            spellChecker: false,
            maxHeight: '400px',
            autofocus: true,
            placeholder: 'Введите текст...',
            status: false,
            autosave: {
                enabled: true,
                delay: 1000,
            },
        }),
        [],
    );

    const onSubmit = async () => {
        try {
            setLoading(true);

            const fields = {
                title,
                imageUrl,
                text,
                tags
            };

            const {data} = isEditing ? await axios.patch(`/posts/${id}`, fields) : await axios.post('/posts', fields);

            const _id = isEditing ? id : data._id;

            navigate(`/posts/${_id}`);
        } catch (e) {
            console.warn(e);
            alert('Ошибка при создании статьи');
        }
    };

    useEffect(() => {
        if (id) {
            axios.get(`/posts/${id}`).then(({data}) => {
                setTitle(data.title);
                setText(data.text);
                setImageUrl(data.imageUrl);
                setTags(data.tags.join(', '));
            }).catch(err => {
                console.warn(err);
                alert('Ошибка при получении статьи');
            });
        }
    }, []);

    if (!window.localStorage.getItem('token') && !isAuth) {
        return <Navigate to={'/'}/>;
    }

    return (
        <Paper style={{padding: 30}}>
            <Button sx={{mr: 2}} variant="outlined" size="large" onClick={() => inputFileRef.current.click()}>
                Загрузить превью
            </Button>
            <input ref={inputFileRef} type="file" onChange={handleChangeFile} hidden/>
            {imageUrl && (
                <>
                    <Button variant="contained" color="error" onClick={onClickRemoveImage}>
                        Удалить
                    </Button>
                    <img className={styles.image} src={`${process.env.REACT_APP_API_URL}${imageUrl}`} alt="Uploaded"/>
                </>
            )}
            <br/>
            <br/>
            <TextField
                classes={{root: styles.title}}
                variant="standard"
                placeholder="Заголовок статьи..."
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
                classes={{root: styles.tags}}
                variant="standard"
                placeholder="Тэги"
                fullWidth
                value={tags}
                onChange={(e) => setTags(e.target.value)}
            />
            <SimpleMDE className={styles.editor} value={text} onChange={onChange} options={options}/>
            <div className={styles.buttons}>
                <Button size="large" variant="contained" onClick={onSubmit}>
                    {isEditing ? 'Сохранить' : 'Опубликовать'}
                </Button>
                <a href="/">
                    <Button size="large">Отмена</Button>
                </a>
            </div>
        </Paper>
    );
};
