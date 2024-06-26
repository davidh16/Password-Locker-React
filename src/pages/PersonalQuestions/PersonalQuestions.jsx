import { useEffect, useState } from 'react';
import axiosInstance from "../../axiosConfig.jsx";
import './PersonalQuestions.css';
import {useNavigate} from 'react-router-dom';
import {useAuth} from "../../AuthContext.jsx";

function PersonalQuestions() {

    const { setAuthInfo } = useAuth();

    const [questions, setQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([
        { personal_question_uuid: "", answer: "" },
        { personal_question_uuid: "", answer: "" },
        { personal_question_uuid: "", answer: "" }
    ]);

    const navigate = useNavigate()

    useEffect(() => {
        axiosInstance.get("list-security-questions")
            .then((response) => {
                const jsonObject = JSON.parse(response.data);
                setQuestions(jsonObject.security_questions);
            })
            .catch(() => {
                navigate("/error")
            });
    }, []);

    const handleSelectChange = (index, value) => {
        setSelectedQuestions(prevSelectedQuestions =>
            prevSelectedQuestions.map((selected, i) =>
                i === index ? { ...selected, personal_question_uuid: value } : selected
            )
        );
    };

    const handleAnswerChange = (index, value) => {
        setSelectedQuestions(prevSelectedQuestions =>
            prevSelectedQuestions.map((selected, i) =>
                i === index ? { ...selected, answer: value } : selected
            )
        );
    };

    const handleSubmit = () => {
        axiosInstance.post("complete-registration", selectedQuestions, { withCredentials: true })
            .then(() => {
                setAuthInfo(prevState => ({
                    ...prevState,
                    registrationCompleted: true
                }))
                navigate("/home")
            })
            .catch(() => {
                navigate("/error")
            });
    };

    const getFilteredQuestions = (index) => {
        return questions.filter(question =>
            !selectedQuestions.some((selected, i) => selected.personal_question_uuid === question.uuid && i !== index)
        );
    };

    return (
        <div className="personal-questions">
            {selectedQuestions.map((selected, index) => (
                <div key={index} className="question-block">
                    <select value={selected.personal_question_uuid || ""} onChange={(e) => handleSelectChange(index, e.target.value)}>
                        <option value="" disabled>
                            Select a security question
                        </option>
                        {getFilteredQuestions(index).map((question) => (
                            <option key={question.uuid} value={question.uuid}>
                                {question.question}
                            </option>
                        ))}
                    </select>
                    <input type="text" placeholder="Your answer" value={selected.answer} onChange={(e) => handleAnswerChange(index, e.target.value)}/>
                </div>
            ))}
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
}

export default PersonalQuestions;
