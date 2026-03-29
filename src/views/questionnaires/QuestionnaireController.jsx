import React from 'react';
import SchoolSurvey from './SchoolSurvey';
import StudentSurvey from './StudentSurvey';
import FamilySurvey from './FamilySurvey';
import ChurchSurvey from './ChurchSurvey';
import ProspectSurvey from './ProspectSurvey';

const QuestionnaireController = ({ userType, onComplete }) => {
  // Safety check: Se não houver tipo selecionado, volta ou mostra erro amigável
  if (!userType) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Aguardando seleção de perfil...</p>
      </div>
    );
  }

  const renderSurvey = () => {
    const typeId = userType?.id;
    
    switch (typeId) {
      case 'mantenedor':
      case 'gestor':
      case 'diretor':
      case 'coordenador':
        return <SchoolSurvey onComplete={onComplete} userType={userType} />;
      
      case 'aluno_ficv':
        return <StudentSurvey onComplete={onComplete} userType={userType} />;
      
      case 'familia_educadora':
        return <FamilySurvey onComplete={onComplete} userType={userType} />;
      
      case 'servo_kids':
      case 'lider_infantil':
        return <ChurchSurvey onComplete={onComplete} userType={userType} />;
      
      default:
        // Pais, acadêmicos, professores básicos e colaboradores
        return <ProspectSurvey onComplete={onComplete} userType={userType} />;
    }
  };

  return (
    <div className="survey-controller fade-in" style={{ minHeight: '100vh', background: 'white' }}>
      {renderSurvey()}
    </div>
  );
};

export default QuestionnaireController;
