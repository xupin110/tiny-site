import React from "react";
import PropTypes from "prop-types";
import { Spin, message, Table, Icon } from "antd";
import moment from "moment";
import { Link } from "react-router-dom";

import "./file_list.sass";
import * as fileService from "../../services/file";
import * as imageService from "../../services/image";
import { getQueryParams, copy } from "../../helpers/util";
import { TIME_FORMAT } from "../../vars";
import { FILE_HANDLER_PATH } from "../../paths";

class FileList extends React.Component {
  state = {
    loading: false,
    zoneName: "",
    zone: 0,
    sort: "-updatedAt",
    fields:
      "id,updatedAt,name,maxAge,zone,type,size,width,height,description,creator,thumbnail",
    files: null,
    imageConfig: null,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    }
  };
  constructor(props) {
    super(props);
    this.state.zone = Number.parseInt(props.match.params.fileZoneID);
    this.state.zoneName = getQueryParams(props.location.search, "name");
  }
  componentDidMount() {
    this.fetchFiles();
    this.fetchConfig();
  }
  async fetchConfig() {
    try {
      const data = await imageService.getConfig();
      this.setState({
        imageConfig: data
      });
    } catch (err) {
      message.error(err.message);
    }
  }
  async fetchFiles() {
    const { loading, zone, fields, pagination, sort } = this.state;
    if (loading) {
      return;
    }
    this.setState({
      loading: true
    });

    try {
      const limit = pagination.pageSize;
      const offset = (pagination.current - 1) * limit;
      const data = await fileService.list({
        offset,
        limit,
        zone,
        sort,
        fields
      });
      const updateData = {
        files: data.files
      };
      if (data.count >= 0) {
        updateData.pagination = Object.assign(
          { ...pagination },
          {
            total: data.count
          }
        );
      }
      this.setState(updateData);
    } catch (err) {
      message.error(err.message);
    } finally {
      this.setState({
        loading: false
      });
    }
  }
  renderList() {
    const { account } = this.props;
    const { files, pagination, zone, zoneName } = this.state;
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
        width: "300px"
      },
      {
        title: "缓存有效欺",
        dataIndex: "maxAge",
        key: "maxAge",
        width: "120px"
      },
      {
        title: "描述",
        dataIndex: "description",
        key: "description"
      },
      {
        title: "更新时间",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: "180px",
        render: text => {
          if (!text) {
            return;
          }
          return moment(text).format(TIME_FORMAT);
        }
      },
      {
        title: "缩略图",
        dataIndex: "thumbnail",
        key: "thumbnail",
        width: "100px",
        render: (text, record) => {
          const { thumbnail } = record;
          if (!thumbnail) {
            return;
          }
          const data = `data:image/${record.type};base64,${record.thumbnail}`;
          return <img alt={"thumbnail"} src={data} />;
        }
      },
      {
        title: "上传者",
        dataIndex: "creator",
        key: "creator",
        width: "120px"
      },
      {
        title: "操作",
        key: "op",
        width: "200px",
        render: (text, record) => {
          let updateLink = null;
          const url =
            FILE_HANDLER_PATH.replace(":fileZoneID", zone) +
            `?name=${zoneName}&fileID=${record.id}`;
          if (record.creator === account) {
            updateLink = (
              <Link to={url}>
                <Icon type="edit" />
                更新
              </Link>
            );
          }
          return (
            <div className="op">
              {updateLink}
              <a
                style={{
                  marginLeft: "5px"
                }}
                href="/copy"
                onClick={e => {
                  e.preventDefault();
                  const { imageConfig } = this.state;
                  if (!imageConfig) {
                    message.error("获取图片相关配置失败，请刷新重试");
                    return;
                  }
                  const file = `${record.name}.${record.type}`;
                  const url = imageConfig.url.replace(":file", file);
                  const err = copy(url, e.target);
                  if (err) {
                    message.error(`复制失败，${err.message}`);
                  } else {
                    message.info("复制文件地址成功");
                  }
                }}
              >
                <Icon type="copy" />
                复制
              </a>
            </div>
          );
        }
      }
    ];
    return (
      <Table
        className="files"
        rowKey={"id"}
        columns={columns}
        pagination={pagination}
        dataSource={files}
        onChange={pagination => {
          this.setState(
            {
              pagination: { ...pagination }
            },
            () => {
              this.fetchFiles();
            }
          );
        }}
      />
    );
  }
  render() {
    const { loading } = this.state;
    return (
      <div className="FileList">
        <Spin spinning={loading}>{this.renderList()}</Spin>
      </div>
    );
  }
}

FileList.propTypes = {
  account: PropTypes.string.isRequired,
  roles: PropTypes.array.isRequired
};

export default FileList;
