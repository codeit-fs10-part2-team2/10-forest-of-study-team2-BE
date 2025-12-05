class StudyListDTO {
  constructor(study) {
    this.study_id = study.study_id;
    this.study_name = study.study_name;
    this.study_introduction = study.study_introduction;
    this.point_sum = study.point_sum;
    this.background = study.background;
    this.createdAt = study.createdAt;
    this.topEmojis = study.topEmojis || [];
    this.totalEmojiCount = study.totalEmojiCount || 0;
  }

  static fromEntity(study) {
    return new StudyListDTO(study);
  }

  static fromEntities(studies) {
    return studies.map(study => StudyListDTO.fromEntity(study));
  }
}

class StudyDetailDTO {
  constructor(data) {
    this.study_id = data.study_id;
    this.study_name = data.study_name;
    this.study_introduction = data.study_introduction;
    this.point_sum = data.point_sum;
    this.emojis = data.emojis || [];
    this.habitFullfillments = data.habitFullfillments || [];
  }

  static fromEntity(study) {
    return new StudyDetailDTO(study);
  }
}

class TodayConcentrationDTO {
  constructor(data) {
    this.study_name = data.study_name;
    this.total_point = data.total_point;
    this.concentration_time = data.concentration_time;
  }

  static fromEntity(study) {
    return new TodayConcentrationDTO(study);
  }
}

module.exports = {
  StudyListDTO,
  StudyDetailDTO,
  TodayConcentrationDTO,
};
